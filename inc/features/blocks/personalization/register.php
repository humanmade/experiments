<?php
/**
 * Personalization Block Server Side.
 *
 * @phpcs:ignoreFile HM.Files.FunctionFileName.WrongFile
 *
 * @package altis-experiments
 */

namespace Altis\Experiments\Features\Blocks\Personalization;

use Altis\Experiments;
use Altis\Experiments\Features\Blocks;
use Altis\Experiments\Utils;

const BLOCK = 'personalization';

/**
 * Registers the block type assets and server side rendering.
 */
function setup() {
	$block_data = Blocks\get_block_settings( BLOCK );

	// Queue up JS files.
	add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\\enqueue_assets' );

	// Register the block.
	register_block_type( $block_data['name'], [
		'attributes' => $block_data['settings']['attributes'],
		'render_callback' => __NAMESPACE__ . '\\render_block',
	] );
}

/**
 * Enqueues the block assets.
 */
function enqueue_assets() {
	wp_enqueue_script(
		'altis-experiments-features-blocks-personalization',
		Utils\get_asset_url( 'features/blocks/personalization.js' ),
		[
			'wp-plugins',
			'wp-blocks',
			'wp-i18n',
			'wp-editor',
			'wp-components',
			'wp-core-data',
			'wp-edit-post',
			'altis-experiments-features-blocks-personalization-variant',
			// Exports the audience UI modal component.
			'altis-analytics-audience-ui',
		],
		null
	);

	wp_add_inline_script(
		'altis-experiments-features-blocks-experience',
		sprintf(
			'window.Altis = window.Altis || {};' .
			'window.Altis.Analytics = window.Altis.Analytics || {};' .
			'window.Altis.Analytics.Experiments = window.Altis.Analytics.Experiments || {};' .
			'window.Altis.Analytics.Experiments.BuildURL = %s;',
			wp_json_encode( plugins_url( 'build', dirname( __FILE__, 4 ) ) )
		),
		'before'
	);

	// Queue up editor CSS.
	wp_enqueue_style(
		'altis-experiments-features-blocks-personalization',
		plugins_url( 'inc/features/blocks/personalization/edit.css', Experiments\ROOT_DIR . '/plugin.php' ),
		[],
		'2020-05-22-01'
	);
}

/**
 * Render callback for the experience block.
 *
 * Because this block only saves <InnerBlocks.Content> on the JS side,
 * the content string represents only the wrapped inner block markup.
 *
 * @param array $attributes The block's attributes object.
 * @param string $innerContent The block's saved content.
 * @return string The final rendered block markup, as an HTML string.
 */
function render_block( array $attributes, ?string $inner_content = '' ) : string {
	static $client_ids = [];

	$client_id = $attributes['clientId'] ?? false;
	$class_name = $attributes['className'] ?? '';
	$align = $attributes['align'] ?? 'none';

	// Add alignment class.
	if ( ! empty( $align ) ) {
		$class_name .= sprintf( 'align%s', $align );
	}

	if ( ! $client_id ) {
		trigger_error( 'Personalization block has no client ID set.', E_USER_WARNING );
		return '';
	}

	// No need to output templates twice for the same parent client ID.
	// This can happen if a reusable block appears twice on a page.
	if ( in_array( $client_id, $client_ids, true ) ) {
		$inner_content = '';
	} else {
		$client_ids[] = $client_id;
	}

	return sprintf(
		'%s<personalization-block class="%s" client-id="%s"></personalization-block>',
		$inner_content,
		$class_name,
		$client_id
	);
}
