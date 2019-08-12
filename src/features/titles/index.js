/* global wp */
import React, { Fragment } from 'react';
import withTestData from './data';
import Settings from './settings';
import Results from './results';
import {
	Panel,
	PluginIcon,
} from './components';

const { PluginSidebar, PluginSidebarMoreMenuItem } = wp.editPost;
const { registerPlugin } = wp.plugins;
const { __ } = wp.i18n;
const { PanelBody } = wp.components;
const { compose } = wp.compose;
const { createElement } = wp.element;

const Plugin = compose(
	withTestData
)( props => {
	const { test } = props;
	const { started, paused, results } = test;
	const { winner = false } = results;

	const classNames = [];

	if ( started ) {
		classNames.push( 'is-started' );
	}

	if ( paused ) {
		classNames.push( 'is-paused' );
	}

	return (
		<Fragment>
			<PluginSidebarMoreMenuItem
				target="altis-ab-tests"
			>
				{ __( 'Experiments', 'altis-ab-tests' ) }
			</PluginSidebarMoreMenuItem>
			<PluginSidebar
				name="altis-ab-tests"
				title={ __( 'Experiments', 'altis-ab-tests' ) }
			>
				<Panel>
					<PanelBody
						className={ classNames.join( ' ' ) }
						title={ __( 'Post Titles', 'altis-ab-tests' ) }
						icon={ paused ? 'controls-pause' : 'chart-line' }
						initialOpen={ true }
					>
						{ winner !== false && <Results /> }
						{ winner === false && <Settings /> }
					</PanelBody>
				</Panel>
			</PluginSidebar>
		</Fragment>
	);
} );

registerPlugin( 'altis-ab-tests', {
	title: __( 'Experiments', 'altis-ab-tests' ),
	icon: createElement( PluginIcon ),
	render: Plugin,
} );
