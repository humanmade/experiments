<?php
/**
 * AB Tests.
 *
 * @package altis-experiments
 *
 */

namespace Altis\Experiments;

use function Altis\Analytics\Utils\merge_aggregates;
use function Altis\Analytics\Utils\milliseconds;
use function Altis\Analytics\Utils\query;
use MathPHP\Probability\Distribution\Discrete;
use WP_Post;
use WP_Query;

/**
 * Bootstrap the plugin.
 */
function setup() {
	if ( ! function_exists( 'Altis\Analytics\Utils\milliseconds' ) ) {
		trigger_error( 'Altis AB Tests requires the Altis Analytics plugin to be enabled.', E_USER_WARNING );
		return;
	}

	// Load analytics scripts early.
	add_action( 'altis.analytics.enqueue_scripts', __NAMESPACE__ . '\\enqueue_scripts' );
	add_action( 'altis.analytics.enqueue_scripts', __NAMESPACE__ . '\\output_styles' );

	// Register REST Fields.
	add_action( 'rest_api_init', __NAMESPACE__ . '\\register_post_ab_tests_rest_fields' );

	// Hook cron task.
	add_action( 'altis_post_ab_test_cron', __NAMESPACE__ . '\\handle_post_ab_test_cron', 10, 2 );

	// Register notifications.
	add_action( 'altis.experiments.test.ended', __NAMESPACE__ . '\\send_post_ab_test_notification', 10, 2 );
	add_action( 'altis.experiments.test.winner_found', __NAMESPACE__ . '\\send_post_ab_test_notification', 10, 2 );

	/**
	 * Enable Title AB Tests.
	 *
	 * @param bool $enabled Whether to enable this feature or not.
	 */
	$titles_feature = apply_filters( 'altis.experiments.features.titles', true );
	if ( $titles_feature ) {
		require_once ROOT_DIR . '/inc/features/titles/namespace.php';
		Features\Titles\setup();
	}
}

/**
 * Queue up the tracker script and required configuration.
 */
function enqueue_scripts() {
	wp_enqueue_script(
		'altis-experiments',
		plugins_url( 'build/experiments.js', ROOT_DIR . '/plugin.php' ),
		[
			'altis-analytics',
		]
	);
	wp_add_inline_script(
		'altis-experiments',
		sprintf(
			'var Altis = Altis || {}; Altis.Analytics = Altis.Analytics || {}; Altis.Analytics.Experiments = %s;',
			wp_json_encode( [
				'BuildURL' => plugins_url( 'build/', ROOT_DIR . '/plugin.php' ),
			] )
		),
		'before'
	);
}

/**
 * Default CSS styles hide all but the first test-variant element when
 * javascript isn't running.
 */
function output_styles() {
	echo '<style>test-variant { display: none; visibility: hidden; }</style>';
}

/**
 * Get all registered Post AB Tests.
 *
 * @return array
 */
function get_post_ab_tests() : array {
	global $post_ab_tests;
	return (array) $post_ab_tests;
}

/**
 * Get a registered test by its ID.
 *
 * @param string $test_id The ID of a registered test.
 * @return array
 */
function get_post_ab_test( string $test_id ) : array {
	global $post_ab_tests;
	return $post_ab_tests[ $test_id ];
}

/**
 * Register the rest api field for all the tests on a post.
 */
function register_post_ab_tests_rest_fields() {
	register_rest_field( 'post', 'ab_tests', [
		'get_callback' => function ( $post ) {
			$response = [];
			foreach ( array_keys( get_post_ab_tests() ) as $test_id ) {
				$response[ $test_id ] = [
					'started'            => is_ab_test_started_for_post( $test_id, $post['id'] ),
					'start_time'         => get_ab_test_start_time_for_post( $test_id, $post['id'] ),
					'end_time'           => get_ab_test_end_time_for_post( $test_id, $post['id'] ),
					'traffic_percentage' => get_ab_test_traffic_percentage_for_post( $test_id, $post['id'] ),
					'paused'             => is_ab_test_paused_for_post( $test_id, $post['id'] ),
					'results'            => (object) get_ab_test_results_for_post( $test_id, $post['id'] ),
				];
			}
			return $response;
		},
		'update_callback' => function ( $value, WP_Post $post ) {
			foreach ( $value as $test_id => $test ) {
				if ( isset( $test['started'] ) ) {
					update_is_ab_test_started_for_post( $test_id, $post->ID, $test['started'] );
				}
				if ( isset( $test['start_time'] ) ) {
					update_ab_test_start_time_for_post( $test_id, $post->ID, $test['start_time'] );
				}
				if ( isset( $test['end_time'] ) ) {
					update_ab_test_end_time_for_post( $test_id, $post->ID, $test['end_time'] );
				}
				if ( isset( $test['traffic_percentage'] ) ) {
					update_ab_test_traffic_percentage_for_post( $test_id, $post->ID, $test['traffic_percentage'] );
				}
				if ( isset( $test['paused'] ) ) {
					update_is_ab_test_paused_for_post( $test_id, $post->ID, $test['paused'] );
				}
			}
		},
		'schema' => [
			'type' => 'object',
			'patternProperties' => [
				'.*' => [
					'type' => 'object',
					'properties' => [
						'started' => [
							'type' => 'boolean',
						],
						'start_time' => [
							'type' => 'integer',
						],
						'end_time' => [
							'type' => 'integer',
						],
						'traffic_percentage' => [
							'type' => 'number',
						],
						'paused' => [
							'type' => 'boolean',
						],
						'results' => [
							'type' => 'object',
							'required' => false,
							'readOnly' => true,
							'properties' => [
								'timestamp' => [
									'type' => 'integer',
								],
								'winning' => [
									'type' => 'integer',
								],
								'winner' => [
									'type' => 'integer',
								],
								'aggs' => [
									'type' => 'array',
									'items' => [
										'type' => 'object',
									],
								],
								'variants' => [
									'type' => 'array',
									'items' => [
										'type' => 'object',
										'properties' => [
											'value' => [
												'type' => [ 'number', 'string' ],
												'description' => __( 'Variant value', 'altis-experiments' ),
											],
											'size' => [
												'type' => 'integer',
												'default' => 0,
												'description' => __( 'Variant sample size', 'altis-experiments' ),
											],
											'hits' => [
												'type' => 'integer',
												'default' => 0,
												'description' => __( 'Variant conversion count', 'altis-experiments' ),
											],
											'rate' => [
												'type' => 'number',
												'default' => 0,
												'description' => __( 'Variant conversion rate', 'altis-experiments' ),
											],
											'p' => [
												'type' => 'number',
												'default' => 1,
												'description' => __( 'Variant p-value', 'altis-experiments' ),
											],
										],
									],
								],
							],
						],
					],
				],
			],
		],
	] );
}

/**
 * Register an AB test for post objects.
 *
 * @param string $test_id
 * @param array $options
 *     $options = [
 *       'label' => (string) A human readable name for the test.
 *       'rest_api_variants_field' => (string) REST API field name to return variants on.
 *       'rest_api_variants_type' => (string) REST API field data type.
 *       'goal' => (string) The event handler.
 *       'variant_callback' => (callable) Callback for providing the variant output.
 *       'winner_callback' => (callable) Callback for modifying the post with the winning variant value.
 *       'query_filter' => (array|callable) Elasticsearch bool filter to narrow down overall result set.
 *       'goal_filter' => (array|callable) Elasticsearch bool filter to determine conversion events.
 *     ]
 */
function register_post_ab_test( string $test_id, array $options ) {
	global $post_ab_tests;

	$options = wp_parse_args( $options, [
		'label' => $test_id,
		'rest_api_variants_field' => 'ab_test_' . $test_id,
		'rest_api_variants_type' => 'string',
		'goal' => 'click',
		'variant_callback' => function ( $value, int $post_id, array $args ) {
			return $value;
		},
		'winner_callback' => function ( $value, int $post_id ) {
			// Default no-op.
		},
		'query_filter' => [],
		'goal_filter' => [],
	] );

	$post_ab_tests[ $test_id ] = $options;

	register_rest_field(
		'post',
		$options['rest_api_variants_field'],
		[
			'get_callback' => function ( $post ) use ( $test_id ) : array {
				return get_ab_test_variants_for_post( $test_id, $post['id'] );
			},
			'update_callback' => function ( array $variants, WP_Post $post ) use ( $test_id ) {
				return update_ab_test_variants_for_post( $test_id, $post->ID, $variants );
			},
			'schema' => [
				'type' => 'array',
				'items' => [
					'type' => $options['rest_api_variants_type'],
				],
			],
		]
	);

	// Set up background task.
	if ( ! wp_next_scheduled( 'altis_post_ab_test_cron', [ $test_id ] ) ) {
		wp_schedule_event( time(), 'hourly', 'altis_post_ab_test_cron', [ $test_id ] );
	}
}

/**
 * Dispatches an email notification with a link to the post edit screen.
 *
 * @param string $test_id
 * @param integer $post_id
 */
function send_post_ab_test_notification( string $test_id, int $post_id ) {
	$test = get_post_ab_test( $test_id );

	// Get post and post author.
	$post = get_post( $post_id );

	$subject = sprintf(
		// translators: %1$s = test name, %2$s = post title.
		__( 'Your test %1$s on "%2$s" has finished', 'altis-experiments' ),
		$test['label'],
		$post->post_title
	);
	$message = sprintf(
		// translators: %s is replaced by an link to edit the post.
		__( "Click the link below to view the results:\n\n%s", 'altis-experiments' ),
		get_edit_post_link( $post_id, 'db' ) . '#experiments-' . $test_id
	);

	/**
	 * Filter the recipients list for the test results.
	 *
	 * @param array $recipients List of user IDs.
	 * @param string $test_id
	 * @param int $post_id
	 */
	$recipients = apply_filters(
		'altis.experiments.test.notification.recipients',
		[ $post->post_author ],
		$test_id,
		$post_id
	);

	foreach ( $recipients as $recipient ) {
		$user = get_user_by( 'id', $recipient );
		if ( ! $user || is_wp_error( $user ) ) {
			continue;
		}

		wp_mail(
			$user->get( 'email' ),
			$subject,
			$message
		);
	}
}

/**
 * Process results for each test.
 *
 * @param string $test_id
 * @param integer $page
 */
function handle_post_ab_test_cron( string $test_id, int $page = 1 ) {
	$posts_per_page = 50;
	$posts = new WP_Query( [
		'post_type' => get_post_types( [ 'public' => true ] ),
		'fields' => 'ids',
		'post_status' => 'publish',
		'posts_per_page' => $posts_per_page,
		'paged' => $page,
		// phpcs:ignore
		'meta_key' => '_altis_ab_test_' . $test_id . '_variants',
	] );

	foreach ( $posts->posts as $post_id ) {
		process_post_ab_test_result( $test_id, $post_id );
	}

	// Queue up next batch.
	if ( $posts->found_posts > $page * $posts_per_page ) {
		wp_schedule_single_event( time(), 'altis_post_ab_test_cron', [ $test_id, $page + 1 ] );
	}
}

/**
 * Get all the variants for a given test for a given post.
 *
 * @param string $test_id
 * @param string $post_id
 * @return array
 */
function get_ab_test_variants_for_post( string $test_id, int $post_id ) : array {
	$value = get_post_meta( $post_id, '_altis_ab_test_' . $test_id . '_variants', true );

	if ( $value ) {
		return $value;
	}

	return [];
}

/**
 * Get the start time for a given test for a given post.
 *
 * @param string $test_id
 * @param string $post_id
 * @return int Timestamp
 */
function get_ab_test_start_time_for_post( string $test_id, int $post_id ) : int {
	return (int) get_post_meta( $post_id, '_altis_ab_test_' . $test_id . '_start_time', true ) ?: milliseconds();
}

/**
 * Get the start time for a given test for a given post.
 *
 * @param string $test_id
 * @param string $post_id
 * @return int Timestamp
 */
function get_ab_test_end_time_for_post( string $test_id, int $post_id ) : int {
	return (int) get_post_meta( $post_id, '_altis_ab_test_' . $test_id . '_end_time', true ) ?: milliseconds() + ( 30 * 24 * 60 * 60 * 1000 );
}

/**
 * Get whether the test has been started for a given post.
 *
 * @param string $test_id
 * @param string $post_id
 * @return bool
 */
function is_ab_test_started_for_post( string $test_id, int $post_id ) : bool {
	return (bool) get_post_meta( $post_id, '_altis_ab_test_' . $test_id . '_started', true );
}

/**
 * Get the percentage of traffic to run the test for.
 *
 * @param string $test_id
 * @param string $post_id
 * @return int A percentage
 */
function get_ab_test_traffic_percentage_for_post( string $test_id, int $post_id ) : int {
	return (int) get_post_meta( $post_id, '_altis_ab_test_' . $test_id . '_traffic_percentage', true );
}

/**
 * Get the percentage of traffic to run the test for.
 *
 * @param string $test_id
 * @param string $post_id
 * @return array Results array
 */
function get_ab_test_results_for_post( string $test_id, int $post_id ) : array {
	return (array) get_post_meta( $post_id, '_altis_ab_test_' . $test_id . '_results', true );
}

/**
 * Check if a given test is paused on a post.
 *
 * @param string $test_id
 * @param string $post_id
 * @return bool
 */
function is_ab_test_paused_for_post( string $test_id, int $post_id ) : bool {
	return get_post_meta( $post_id, '_altis_ab_test_' . $test_id . '_paused', true ) !== 'false';
}

/**
 * Update the variants for a test on a given post.
 *
 * @param string $test_id
 * @param string $post_id
 * @param array
 */
function update_ab_test_variants_for_post( string $test_id, int $post_id, array $variants ) {
	/**
	 * If the variants have changed we need to reset the current results
	 * except for the last update timestamp.
	 */
	$old_variants = get_ab_test_variants_for_post( $test_id, $post_id );
	if ( ! empty( array_diff( $old_variants, $variants ) ) ) {
		$results = get_ab_test_results_for_post( $test_id, $post_id );
		update_ab_test_results_for_post( $test_id, $post_id, [
			'timestamp' => $results['timestamp'] ?? 0,
		] );
	}
	return update_post_meta( $post_id, '_altis_ab_test_' . $test_id . '_variants', $variants );
}

/**
 * Update the start time for a given test for a given post.
 *
 * @param string $test_id
 * @param string $post_id
 * @param int $date
 */
function update_ab_test_start_time_for_post( string $test_id, int $post_id, int $date ) {
	update_post_meta( $post_id, '_altis_ab_test_' . $test_id . '_start_time', $date );
}

/**
 * Update the end time for a given test for a given post.
 *
 * @param string $test_id
 * @param string $post_id
 * @param int $date
 */
function update_ab_test_end_time_for_post( string $test_id, int $post_id, int $date ) {
	update_post_meta( $post_id, '_altis_ab_test_' . $test_id . '_end_time', $date );
}

/**
 * Update the whather the test has been started for a given post.
 *
 * @param string $test_id
 * @param string $post_id
 * @param bool $is_started
 */
function update_is_ab_test_started_for_post( string $test_id, int $post_id, bool $is_started ) {
	update_post_meta( $post_id, '_altis_ab_test_' . $test_id . '_started', $is_started );
}

/**
 * Update the percentage of traffic to run the test for.
 *
 * @param string $test_id
 * @param string $post_id
 * @param int $percent
 */
function update_ab_test_traffic_percentage_for_post( string $test_id, int $post_id, int $percent ) {
	update_post_meta( $post_id, '_altis_ab_test_' . $test_id . '_traffic_percentage', $percent );
}

/**
 * Update the results for the test.
 *
 * @param string $test_id
 * @param string $post_id
 * @param array $data
 */
function update_ab_test_results_for_post( string $test_id, int $post_id, array $data ) {
	update_post_meta( $post_id, '_altis_ab_test_' . $test_id . '_results', $data );
}

/**
 * Check if a given test is paused on a post.
 *
 * @param string $test_id
 * @param string $post_id
 * @param bool $is_paused
 * @return bool
 */
function update_is_ab_test_paused_for_post( string $test_id, int $post_id, bool $is_paused ) {
	update_post_meta( $post_id, '_altis_ab_test_' . $test_id . '_paused', $is_paused ? 'true' : 'false' );
}

/**
 * Check if the given test is running or not.
 *
 * @param string $test_id
 * @param integer $post_id
 * @return boolean
 */
function is_ab_test_running_for_post( string $test_id, int $post_id ) : bool {
	$has_variants = (bool) get_ab_test_variants_for_post( $test_id, $post_id );
	$is_started = (bool) is_ab_test_started_for_post( $test_id, $post_id );
	$is_paused = (bool) is_ab_test_paused_for_post( $test_id, $post_id );
	$start_time = (int) get_ab_test_start_time_for_post( $test_id, $post_id );
	$end_time = (int) get_ab_test_end_time_for_post( $test_id, $post_id );
	return $has_variants && $is_started && ! $is_paused && $start_time <= milliseconds() && $end_time > milliseconds();
}

/**
 * Save completed results for the test to post meta for later reference.
 *
 * @param string $test_id
 * @param string $post_id
 * @param array $data
 */
function save_ab_test_results_for_post( string $test_id, int $post_id, array $data ) {
	$data = wp_parse_args( $data, [
		'timestamp' => milliseconds(),
		'winner' => false,
		'variants' => [],
	] );
	add_post_meta( $post_id, '_altis_ab_test_' . $test_id . '_completed', $data );
}

/**
 * Render the AB Test markup for the given test and post.
 *
 * @param string $test_id The current test ID.
 * @param integer $post_id The post ID for the test.
 * @param string $default_output The fallback / control variant output.
 * @param array $args Optional array of args to pass through to the `variant_callback`.
 * @return string
 */
function output_ab_test_html_for_post( string $test_id, int $post_id, string $default_output, array $args = [] ) : string {
	$test = get_post_ab_test( $test_id );
	$variants = get_ab_test_variants_for_post( $test_id, $post_id );

	// Check for a winner and return that if present.
	$results = get_ab_test_results_for_post( $test_id, $post_id );
	if ( isset( $results['winner'] ) && $results['winner'] !== false ) {
		if ( $results['winner'] === 0 ) {
			return $default_output;
		}

		$winner = $results['winner'] - 1;
		return call_user_func_array(
			$test['variant_callback'],
			[ $variants[ $winner ], $post_id, $args ]
		);
	}

	// Return default value if test is otherwise not running.
	if ( ! is_ab_test_running_for_post( $test_id, $post_id ) ) {
		return $default_output;
	}

	// Generate AB Test markup.
	ob_start();
	?>
	<ab-test
		test-id="<?php echo esc_attr( $test_id ); ?>"
		post-id="<?php echo esc_attr( $post_id ); ?>"
		traffic-percentage="<?php echo get_ab_test_traffic_percentage_for_post( $test_id, $post_id ); ?>"
		goal="<?php echo esc_attr( $test['goal'] ); ?>"
		variant-count="<?php echo intval( count( $variants ) ); ?>"
	>
		<test-fallback><?php echo $default_output; ?></test-fallback>
		<?php foreach ( $variants as $variant ) : ?>
		<test-variant>
			<?php echo call_user_func_array( $test['variant_callback'], [ $variant, $post_id, $args ] ); ?>
		</test-variant>
		<?php endforeach; ?>
	</ab-test>
	<?php
	return ob_get_clean();
}

/**
 * Processes the goal configuration, requests analytics data from Elasticsearch
 * and merges it with existing data before performning statistical analysis.
 */
function process_post_ab_test_result( string $test_id, int $post_id ) {
	$test = get_post_ab_test( $test_id );

	if ( empty( $test ) ) {
		return;
	}

	// Get a unique ID for the test.
	$test_id_with_post = $test_id . '_' . $post_id;

	// Get existing data for use with queries.
	$data = get_ab_test_results_for_post( $test_id, $post_id );

	// Bail if test no longer running.
	if ( ! is_ab_test_running_for_post( $test_id, $post_id ) ) {
		if ( get_ab_test_end_time_for_post( $test_id, $post_id ) <= milliseconds() ) {
			// Pause the test.
			update_is_ab_test_paused_for_post( $test_id, $post_id, true );

			/**
			 * Dispatch action when test has ended.
			 *
			 * @param string $test_id The test ID.
			 * @param string $post_id The post ID for the test.
			 * @param array $data The test results so far.
			 */
			do_action( 'altis.experiments.test.ended', $test_id, $post_id );

			/**
			 * Dispatch action when a test of this type has ended.
			 *
			 * @param string $post_id The post ID for the test.
			 * @param array $data The test results so far.
			 */
			do_action( "altis.experiments.test.ended.{$test_id}", $post_id );
		}
		return;
	}

	// Process event filter.
	if ( is_callable( $test['query_filter'] ) ) {
		$query_filter = call_user_func_array( $test['query_filter'], [ $test_id, $post_id ] );
	} else {
		$query_filter = $test['query_filter'];
	}

	if ( ! is_array( $query_filter ) ) {
		trigger_error( sprintf(
			'AB Tests: Query filter for test %s on post %d is not an array',
			$test_id,
			$post_id
		), E_USER_WARNING );
		return;
	}

	$query_filter = wp_parse_args( $query_filter, [
		'filter' => [],
		'should' => [],
		'must' => [],
		'must_not' => [],
	] );

	// Scope to events associated with this test.
	$query_filter['filter'][] = [
		'exists' => [
			'field' => sprintf( 'attributes.test_%s.keyword', $test_id_with_post ),
		],
	];

	// Add time based filter from last updated timestamp.
	$query_filter['filter'][] = [
		'range' => [
			'event_timestamp' => [
				'gt' => $data['timestamp'] ?? 0,
			],
		],
	];

	// Build conversion filters.
	if ( is_callable( $test['goal_filter'] ) ) {
		$goal_filter = call_user_func_array( $test['goal_filter'], [ $test_id, $post_id ] );
	} else {
		$goal_filter = $test['goal_filter'];
	}

	if ( ! is_array( $goal_filter ) ) {
		trigger_error( sprintf(
			'AB Tests: Goal filter for test %s on post %d is not an array',
			$test_id,
			$post_id
		), E_USER_WARNING );
		return;
	}

	$goal_filter = wp_parse_args( $goal_filter, [
		'filter' => [],
		'should' => [],
		'must' => [],
		'must_not' => [],
	] );

	// Filter by the goal event name by default.
	$goal = explode( ':', $test['goal'] ); // Extract the event type and not the selector.
	$goal_filter['filter'][] = [
		'term' => [ 'event_type.keyword' => $goal[0] ],
	];
	$goal_filter['filter'][] = [
		'term' => [ 'attributes.eventTestId' => $test_id ],
	];
	$goal_filter['filter'][] = [
		'term' => [ 'attributes.eventPostId' => $post_id ],
	];

	// Collect aggregates for statistical analysis.
	$test_aggregation = [
		// Variant buckets.
		'test' => [
			'terms' => [
				'field' => sprintf( 'attributes.test_%s.keyword', $test_id_with_post ),
			],
			'aggs' => [
				// Conversion events.
				'conversions' => [
					'filter' => [
						'bool' => $goal_filter,
					],
				],
				// Number of unique page sessions where test is running.
				'impressions' => [
					'cardinality' => [
						'field' => 'attributes.pageSession.keyword',
					],
				],
			],
		],
		'timestamp' => [
			'max' => [
				'field' => 'event_timestamp',
			],
		],
	];

	$query = [
		'size' => 0,
		'query' => [
			'bool' => $query_filter,
		],
		'aggs' => $test_aggregation,
		'sort' => [
			'event_timestamp' => 'desc',
		],
	];

	// Fetch results & exclude underscore prefixed buckets.
	$result = query( $query, [
		// Exclude hit data and underscore prefixed aggs.
		'filter_path' => '-hits.hits,-aggregations.**._*',
		// Return aggregation type with keys.
		'typed_keys' => '',
	] );

	if ( empty( $data ) ) {
		return;
	}

	// Merge existing data.
	$merged_data = wp_parse_args( $data, [
		'timestamp' => 0,
		'winning' => false,
		'winner' => false,
		'aggs' => [],
		'variants' => [],
	] );

	$merged_data['timestamp'] = max(
		$merged_data['timestamp'],
		$result['aggregations']['max#timestamp']['value'] ?? 0
	);

	// Sort buckets by variant ID.
	$variants = get_ab_test_variants_for_post( $test_id, $post_id );
	$new_aggs = $result['aggregations']['sterms#test']['buckets'] ?? [];
	$sorted_aggs = array_fill( 0, count( $variants ), [] );

	foreach ( $new_aggs as $aggregation ) {
		$sorted_aggs[ $aggregation['key'] ] = $aggregation;
	}

	$merged_data['aggs'] = merge_aggregates(
		$merged_data['aggs'],
		$sorted_aggs
	);

	// Process for a winner.
	$processed_results = analyse_ab_test_results( $merged_data['aggs'], $test_id, $post_id );
	$merged_data = wp_parse_args( $processed_results, $merged_data );

	// Save updated data.
	update_ab_test_results_for_post( $test_id, $post_id, $merged_data );
}

/**
 * Process hits & impressions to find a statistically significant winner.
 *
 * @param array $aggregations Results from elasticsearch.
 * @return array Array of winner ID, current winning variant ID and variant stats.
 */
function analyse_ab_test_results( array $aggregations, string $test_id, int $post_id ) : array {
	$test = get_post_ab_test( $test_id );
	$variant_values = get_ab_test_variants_for_post( $test_id, $post_id );

	// Track winning variant.
	$winner = false;
	$winning = false;
	$max_rate = 0.0;
	$variants = [];

	foreach ( $aggregations as $id => $agg ) {
		$size = $agg['cardinality#impressions']['value'] ?? 0;
		$hits = $agg['filter#conversions']['doc_count'] ?? 0;
		$rate = $size ? $hits / $size : 0;

		$variants[ $id ] = [
			'value' => $variant_values[ $id ],
			'size' => $size,
			'hits' => $hits,
			'rate' => $rate,
			'p' => null,
		];

		// Check if this variant is winning.
		if ( $rate > $max_rate ) {
			$max_rate = $rate;

			// Check sample size is large enough.
			if ( $size * $rate >= 5 && $size * ( 1 - $rate ) >= 5 ) {
				$winning = $id;
			}
		}

		// Get p-value.
		// Compare hit rate of variant against control using discrete binomial distribution.
		// Pass the success rate for this variant to the probability mass function.
		$control = $variants[0];
		$binomial = new Discrete\Binomial( $size, $control['rate'] );
		$variants[ $id ]['p'] = $binomial->pmf( $hits );
	}

	// Find if a variant is winning, ie. reject null hypothesis.
	if ( $winning !== false ) {
		$winning_variant = $variants[ $winning ];
		// Require 99% certainty.
		if ( ! is_null( $winning_variant['p'] ) && $winning_variant['p'] < 0.01 ) {
			$winner = $winning;

			// Pause the test.
			update_is_ab_test_paused_for_post( $test_id, $post_id, true );

			// Update the end date.
			update_ab_test_end_time_for_post( $test_id, $post_id, milliseconds() );

			// Store results safely.
			save_ab_test_results_for_post( $test_id, $post_id, [
				'winner' => $winner,
				'variants' => $variants,
			] );

			/**
			 * Dispatch action when winner found.
			 *
			 * @param string $test_id
			 * @param int $post_id
			 */
			do_action( 'altis.experiments.test.winner_found', $test_id, $post_id );

			/**
			 * Dispatch action when winner found for test.
			 *
			 * @param int $post_id
			 */
			do_action( "altis.experiments.test.winner_found.{$test_id}", $post_id );

			/**
			 * Run winner callback.
			 */
			if ( isset( $test['winner_callback'] ) && is_callable( $test['winner_callback'] ) ) {
				call_user_func_array( $test['winner_callback'], [ $winning_variant['value'], $post_id ] );
			}
		}
	}

	return [
		'winning' => $winning,
		'winner' => $winner,
		'variants' => $variants,
	];
}
