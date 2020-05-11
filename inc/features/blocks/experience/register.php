<?php
/**
 * Experience Block Server Side.
 *
 * @phpcs:ignoreFile HM.Files.FunctionFileName.WrongFile
 */

namespace Altis\Experiments\Features\Blocks\Experience;

use const Altis\Experiments\ROOT_DIR;
use function Altis\Experiments\Features\Blocks\get_block_settings;

const BLOCK = 'experience';

function setup() {
	$block_data = get_block_settings( BLOCK );

	// Queue up JS files.
	add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\\enqueue_assets' );

	// Register the block.
	register_block_type( $block_data['name'], [
		'attributes' => $block_data['settings']['attributes'],
		'render_callback' => __NAMESPACE__ . '\\render_block',
	] );
}

function enqueue_assets() {
	wp_enqueue_script(
		'altis-experiments-features-blocks-experience',
		plugins_url( 'build/features/blocks/experience.js', ROOT_DIR . '/plugin.php' ),
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

	// Queue up editor CSS.
	wp_enqueue_style(
		'altis-experiments-features-blocks-experience',
		plugins_url( 'inc/features/blocks/experience/edit.css', ROOT_DIR . '/plugin.php' )
	);
}

/**
 * Render callback for the experience block.
 *
 * Because this block only saves <InnerBlocks.Content> on the JS side,
 * the content string represents only the wrapped inner block markup.
 *
 * @param array  $attributes   The block's attributes object.
 * @param string $innerContent The block's saved content.
 * @return string The final rendered block markup, as an HTML string.
 */
function render_block( array $attributes, ?string $inner_content = '' ) : string {
	$client_id = $attributes['clientId'] ?? false;
	$class_name = $attributes['className'] ?? '';
	$align = $attributes['align'] ?? 'none';

	// Add alignment class.
	if ( ! empty( $align ) ) {
		$class_name .= sprintf( 'align%s', $align );
	}

	if ( ! $client_id ) {
		trigger_error( 'Experience block has no client ID set.', E_USER_WARNING );
		return '';
	}

	return sprintf(
		'%s<experience-block class="%s" client-id="%s" />',
		$inner_content,
		$class_name,
		$client_id
	);
}
