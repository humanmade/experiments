<?php
/**
 * Personalization Variant Block Server Side.
 *
 * @phpcs:ignoreFile HM.Files.FunctionFileName.WrongFile
 *
 * @package altis-experiments
 */

namespace Altis\Experiments\Features\Blocks\Personalization_Variant;

use Altis\Experiments\Features\Blocks;
use Altis\Experiments\Utils;

const BLOCK = 'personalization-variant';

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
		'altis-experiments-features-blocks-personalization-variant',
		Utils\get_asset_url( 'features/blocks/personalization-variant.js' ),
		[],
		null
	);

	wp_add_inline_script(
		'altis-experiments-features-blocks-personalization-variant',
		sprintf(
			'window.Altis = window.Altis || {};' .
			'window.Altis.Analytics = window.Altis.Analytics || {};' .
			'window.Altis.Analytics.Experiments = window.Altis.Analytics.Experiments || {};' .
			'window.Altis.Analytics.Experiments.BuildURL = %s;',
			wp_json_encode( plugins_url( 'build', dirname( __FILE__, 4 ) ) )
		),
		'before'
	);
}

/**
 * Render callback for the personalization variant block.
 *
 * Because this block only saves <InnerBlocks.Content> on the JS side,
 * the content string represents only the wrapped inner block markup.
 *
 * @param array  $attributes   The block's attributes object.
 * @param string $innerContent The block's saved content.
 * @return string The final rendered block markup, as an HTML string.
 */
function render_block( array $attributes, ?string $inner_content = '' ) : string {
	$parent_id = $attributes['parentId'] ?? false;
	$audience = $attributes['audience'] ?? 0;

	if ( ! $parent_id ) {
		trigger_error( 'Personalization block variant has no parent ID set.', E_USER_WARNING );
		return '';
	}

	return sprintf(
		'<template data-audience="%d" data-parent-id="%s">%s</template>',
		$audience,
		$parent_id,
		$inner_content
	);
}
