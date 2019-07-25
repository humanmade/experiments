<?php
/**
 * Title AB testing feature.
 *
 * @package altis-ab-tests
 */

namespace Altis\AB_Tests\Features\Titles;

use const Altis\AB_Tests\ROOT_DIR;
use function Altis\AB_Tests\is_test_running_for_post;
use function Altis\AB_Tests\output_test_html_for_post;
use function Altis\AB_Tests\register_post_ab_test;

/**
 * Bootstrap Title AB Tests Feature.
 *
 * @return void
 */
function setup() {
	add_action( 'admin_enqueue_scripts', __NAMESPACE__ . '\\admin_scripts' );
	add_action( 'init', __NAMESPACE__ . '\\init' );
}

/**
 * Load Block Editor sidebar plugin.
 *
 * @param string $hook
 */
function admin_scripts( string $hook ) {
	if ( ! in_array( $hook, [ 'post.php', 'post-new.php' ], true ) ) {
		return;
	}

	if ( ! in_array( get_current_screen()->post_type, get_post_types( [ 'public' => true ] ), true ) ) {
		return;
	}

	wp_enqueue_script(
		'altis-ab-tests-features-titles',
		plugins_url( 'build/features/titles.js', ROOT_DIR . '/plugin.php' ),
		[
			'wp-plugins',
			'wp-blocks',
			'wp-i18n',
			'wp-editor',
			'wp-components',
			'wp-core-data',
			'wp-edit-post',
		]
	);
}

/**
 * Replace title output with the AB Test markup equivalent.
 *
 * @param string $title The current title text.
 * @param integer $post_id The post ID.
 * @return string
 */
function add_title_ab_test_to_title( string $title, int $post_id ) : string {
	if ( ! is_test_running_for_post( 'titles', $post_id ) ) {
		return $title;
	}

	return output_test_html_for_post( 'titles', $post_id, $title );
}

/**
 * Set up the post meta for our titles and create the tests.
 */
function init() {
	if ( ! is_admin() ) {
		add_filter( 'the_title', __NAMESPACE__ . '\\add_title_ab_test_to_title', 10, 2 );
	}

	register_post_ab_test(
		'titles',
		[
			'goal' => 'click',
			// Exclude all events from the target post page.
			'query_filter' => function ( $test_id, $post_id ) : array {
				$url = get_the_permalink( $post_id );
				return [
					'must_not' => [
						[ 'prefix' => [ 'attributes.url.keyword' => $url ] ],
					],
				];
			},
		]
	);
}
