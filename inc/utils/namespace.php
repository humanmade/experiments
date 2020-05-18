<?php
/**
 * Helper functions for the experiments plugin.
 *
 * @package altis-experiments
 */

namespace Altis\Experiments\Utils;

use const Altis\Experiments\ROOT_DIR;

/**
 * Return asset file name based on generated manifest.json file.
 *
 * @param string $filename
 * @return string|false
 */
function get_asset_url( string $filename ) {
	$manifest_file = ROOT_DIR . '/build/manifest.json';

	if ( ! file_exists( $manifest_file ) ) {
		return false;
	}

	// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	$manifest = file_get_contents( $manifest_file );
	$manifest = json_decode( $manifest, true );

	if ( ! $manifest || ! isset( $manifest[ $filename ] ) ) {
		return false;
	}

	$path = $manifest[ $filename ];

	if ( strpos( $path, 'http' ) !== false ) {
		return $path;
	}

	return plugins_url( $manifest[ $filename ], ROOT_DIR . '/build/assets' );
}
