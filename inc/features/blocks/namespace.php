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
	require_once __DIR__ . '/experience/register.php';
	require_once __DIR__ . '/variant/register.php';

	// Register blocks.
	Experience\setup();
	Variant\setup();
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
		trigger_error( 'Error reading %/block.json: file does not exist.', E_USER_WARNING );
		return null;
	}

	// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	$json = file_get_contents( $json_path );

	// Decode the settings.
	$settings = json_decode( $json, ARRAY_A );

	// Check JSON is valid.
	if ( json_last_error() ) {
		trigger_error( sprintf( 'Error decoding %/block.json: %s', $name, json_last_error_msg() ), E_USER_WARNING );
		return null;
	}

	return $settings;
}
