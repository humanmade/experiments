<?php
/**
 * Experience Block functions.
 *
 * @package altis-experiments
 */

namespace Altis\Experiments\Features\Blocks;

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
