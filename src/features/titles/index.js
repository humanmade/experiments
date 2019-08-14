/* global wp */
import Plugin from './plugin';
import { PluginIcon } from './components';

const { registerPlugin } = wp.plugins;
const { __ } = wp.i18n;
const { createElement } = wp.element;

registerPlugin( 'altis-experiments', {
	title: __( 'Experiments', 'altis-experiments' ),
	icon: createElement( PluginIcon ),
	render: Plugin,
} );
