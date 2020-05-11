<?php
/**
 * Experience Block functions.
 */

namespace Altis\Experiments\Features\Blocks;

function setup() {
	require_once __DIR__ . '/experience/register.php';
	require_once __DIR__ . '/variant/register.php';

	// Register blocks.
	Experience\setup();
	Variant\setup();
}

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
