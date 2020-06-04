<?php
/**
 * Helper functions for the experiments plugin.
 *
 * @package altis-experiments
 */

namespace Altis\Experiments\Utils;

use Altis\Experiments;

/**
 * Return asset file name based on generated manifest.json file.
 *
 * @param string $filename The entrypoint filename used in webpack.config.js.
 * @return string|false The URL of the generated asset file.
 */
function get_asset_url( string $filename ) {
	$manifest_file = Experiments\ROOT_DIR . '/build/manifest.json';

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

	return plugins_url( $manifest[ $filename ], $manifest_file );
}
