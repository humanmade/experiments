<?php
/**
 * Plugin Name: Altis Experiments
 * Description: A companion plugin to Altis Analytics that provides a web experimentation framework.
 * Version: 2.2.2
 * Author: Human Made Limited
 * Author URL: https://humanmade.com/
 */

namespace Altis\Experiments;

const ROOT_DIR = __DIR__;
const ROOT_FILE = __FILE__;

// Check if this is installed as a self contained built version.
if ( file_exists( ROOT_DIR . '/vendor/autoload.php' ) ) {
	require_once ROOT_DIR . '/vendor/autoload.php';
}

require_once ROOT_DIR . '/inc/namespace.php';
require_once ROOT_DIR . '/inc/utils/namespace.php';

add_action( 'plugins_loaded', __NAMESPACE__ . '\\setup', 11 );
