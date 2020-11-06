<?php
/**
 * Experience Block functions.
 *
 * @package altis-experiments
 */

namespace Altis\Experiments\Features\Blocks;

use Altis\Analytics\Audiences;
use Altis\Analytics\Utils;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

/**
 * Include and set up Experience Blocks.
 */
function setup() {
	require_once __DIR__ . '/personalization/register.php';
	require_once __DIR__ . '/personalization-variant/register.php';

	// Register blocks.
	Personalization\setup();
	Personalization_Variant\setup();

	// Register experience block category.
	add_filter( 'block_categories', __NAMESPACE__ . '\\add_block_category', 9 );

	// Register API endpoints for getting XB analytics data.
	add_action( 'rest_api_init', __NAMESPACE__ . '\\rest_api_init' );
}

/**
 * Adds an experience block category to the block editor.
 *
 * @param array $categories Array of block editor block type categories.
 * @return array The modified block categories array.
 */
function add_block_category( array $categories ) : array {
	$categories[] = [
		'slug' => 'altis-experience-blocks',
		'title' => __( 'Experience Blocks', 'altis-experiments' ),
	];

	return $categories;
}

/**
 * Reads and returns a block.json file to pass shared settings
 * between JS and PHP to the register blocks functions.
 *
 * @param string $name The directory name of the block relative to this file.
 * @return array|null The JSON data as an associative array or null on error.
 */
function get_block_settings( string $name ) : ?array {
	$json_path = __DIR__ . '/' . $name . '/block.json';

	// Check name is valid.
	if ( ! file_exists( $json_path ) ) {
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		trigger_error( sprintf( 'Error reading %/block.json: file does not exist.', $name ), E_USER_WARNING );
		return null;
	}

	// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	$json = file_get_contents( $json_path );

	// Decode the settings.
	$settings = json_decode( $json, ARRAY_A );

	// Check JSON is valid.
	if ( json_last_error() !== JSON_ERROR_NONE ) {
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		trigger_error( sprintf( 'Error decoding %/block.json: %s', $name, json_last_error_msg() ), E_USER_WARNING );
		return null;
	}

	return $settings;
}

/**
 * Register REST API endpoints for Experience Blocks.
 *
 * @return void
 */
function rest_api_init() : void {

	// Experience blocks views endpoint.
	register_rest_route( 'analytics/v1', 'xbs/(?P<id>[a-z0-9-]+)/views', [
		[
			'methods' => WP_REST_Server::READABLE,
			'callback' => __NAMESPACE__ . '\\handle_views_request',
			'permission_callback' => __NAMESPACE__ . '\\check_views_permission',
			'args' => [
				'id' => [
					'description' => __( 'The experience block client ID', 'altis-experiments' ),
					'required' => true,
					'type' => 'string',
					'validate_callback' => __NAMESPACE__ . '\\validate_id',
					'sanitize_callback' => __NAMESPACE__ . '\\sanitize_id',
				],
				'post_id' => [
					'description' => __( 'An optional post ID to filter by.', 'altis-experiments' ),
					'type' => 'number',
				],
			],
		],
		'schema' => [
			'type' => 'object',
			'properties' => [
				'total' => [ 'type' => 'number' ],
				'audiences' => [
					'type' => 'array',
					'items' => [
						'type' => 'object',
						'properties' => [
							'id' => [ 'type' => 'number' ],
							'count' => [ 'type' => 'number' ],
						],
					],
				],
				'posts' => [
					'type' => 'array',
					'items' => [
						'type' => 'object',
						'properties' => [
							'id' => [ 'type' => 'number' ],
							'count' => [ 'type' => 'number' ],
							'audiences' => [
								'type' => 'array',
								'items' => [
									'type' => 'object',
									'properties' => [
										'id' => [ 'type' => 'number' ],
										'count' => [ 'type' => 'number' ],
									],
								],
							],
						],
					],
				],
				'postId' => [ 'type' => 'number' ],
			],
		],
	] );
}

/**
 * Validate Experience Block ID.
 *
 * @param string $param The Experience Block ID.
 * @return bool
 */
function validate_id( $param ) : bool {
	return (bool) preg_match( '/[a-z0-9-]+/', $param );
}

/**
 * Sanitize Experience Block ID.
 *
 * @param string $param The Experience Block ID.
 * @return string
 */
function sanitize_id( $param ) : string {
	return preg_replace( '/[^a-z0-9-]+/', '', $param );
}

/**
 * Check current user can view XB analytics data.
 *
 * @return boolean
 */
function check_views_permission() : bool {
	return true;
	$type = get_post_type_object( Audiences\POST_TYPE );
	return current_user_can( $type->cap->edit_posts );
}

/**
 * Retrieve the Experience Block views data.
 *
 * @param WP_REST_Request $request The REST request object.
 * @return WP_REST_Response
 */
function handle_views_request( WP_REST_Request $request ) : WP_REST_Response {
	$block_id = $request->get_param( 'id' );
	$post_id = $request->get_param( 'post_id' ) ?? null;
	$views = get_views( $block_id, $post_id );
	return rest_ensure_response( $views );
}

/**
 * Get the Experience Block views data.
 *
 * @param string $block_id The Experience block client ID to get data for.
 * @param int|null $post_id An optional post ID to limit results by.
 * @return array|WP_Error
 */
function get_views( string $block_id, ?int $post_id = null ) {
	$query = [
		'query' => [
			'bool' => [
				'filter' => [
					// Set current site.
					[
						'term' => [
							'attributes.blogId.keyword' => get_current_blog_id(),
						],
					],

					// Set block ID.
					[
						'term' => [
							'attributes.clientId.keyword' => $block_id,
						],
					],

					// Last month.
					[
						'range' => [
							'event_timestamp' => [
								'gte' => Utils\milliseconds() - ( MONTH_IN_SECONDS * 1000 ),
							],
						],
					],

					// Limit event type to experienceView.
					[
						'term' => [
							'event_type.keyword' => 'experienceView',
						],
					],
				],
			],
		],
		'aggs' => [
			// Get the split by audience.
			'audiences' => [
				'terms' => [
					'field' => 'attributes.audience.keyword',
				],
			],

			// Get the split by post ID and audience.
			'posts' => [
				'terms' => [
					'field' => 'attributes.postId.keyword',
				],
				'aggs' => [
					'audiences' => [
						'terms' => [
							'field' => 'attributes.audience.keyword',
						],
					],
				],
			],
		],
		'size' => 0,
		'sort' => [
			'event_timestamp' => 'desc',
		],
	];

	// Add post ID query filter.
	if ( $post_id ) {
		// Remove the posts aggregation.
		unset( $query['aggs']['posts'] );

		$query['query']['bool']['filter'][] = [
			'term' => [
				'attributes.postId.keyword' => (string) $post_id,
			],
		];
	}

	$key = sprintf( 'views:%s', "{$block_id}:{$post_id}" );
	$cache = wp_cache_get( $key, 'altis-xbs' );
	if ( $cache ) {
		return $cache;
	}

	$result = Utils\query( $query );

	if ( ! $result ) {
		return [
			'total' => 0,
		];
	}

	$audiences = array_map( function ( array $bucket ) {
		return [
			'id' => absint( $bucket['key'] ),
			'count' => $bucket['doc_count'],
		];
	}, $result['aggregations']['audiences']['buckets'] );

	$views = [
		'total' => $result['hits']['total'],
		'audiences' => $audiences,
	];

	// Add the posts aggregations.
	if ( isset( $result['aggregations']['posts']['buckets'] ) ) {
		$views['posts'] = array_map( function ( array $bucket ) {
			$audiences = array_map( function ( array $bucket ) {
				return [
					'id' => absint( $bucket['key'] ),
					'count' => $bucket['doc_count'],
				];
			}, $bucket['audiences']['buckets'] );
			return [
				'id' => absint( $bucket['key'] ),
				'count' => $bucket['doc_count'],
				'audiences' => $audiences,
			];
		}, $result['aggregations']['posts']['buckets'] );
	} else {
		$views['post_id'] = $post_id;
	}

	wp_cache_set( $key, $views, 'altis-xbs', MINUTE_IN_SECONDS );

	return $views;
}
