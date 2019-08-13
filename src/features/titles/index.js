/* global wp */
import React, { Fragment } from 'react';
import withTestData from './with-test-data';
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
	const {
		post,
		test,
	} = props;
	const {
		started,
		paused,
		results,
		end_time: endTime = Date.now() + ( 30 * 24 * 60 * 60 * 1000 ),
	} = test;
	const { winner = false } = results;

	const classNames = [];

	if ( started ) {
		classNames.push( 'is-started' );
	}

	if ( paused ) {
		classNames.push( 'is-paused' );
	}

	const hasEnded = endTime < Date.now();

	// Opt the editing user out of the test.
	// This effectively resets their variant after previewing.
	const tests = JSON.parse( window.localStorage.getItem( '_altis_ab_tests' ) || '{}' );
	tests[ `titles_${ post.id }` ] = false;
	window.localStorage.setItem( '_altis_ab_tests', JSON.stringify( tests ) );

	return (
		<Fragment>
			<PluginSidebarMoreMenuItem
				target="altis-experiments"
			>
				{ __( 'Experiments', 'altis-experiments' ) }
			</PluginSidebarMoreMenuItem>
			<PluginSidebar
				name="altis-experiments"
				title={ __( 'Experiments', 'altis-experiments' ) }
			>
				<Panel>
					<PanelBody
						className={ classNames.join( ' ' ) }
						title={ __( 'Post Titles', 'altis-experiments' ) }
						icon={ paused ? 'controls-pause' : 'chart-line' }
						initialOpen={ true }
					>
						{ ( winner !== false || hasEnded ) && (
							<Results />
						) }
						{ ( winner === false && ! hasEnded ) && (
							<Settings />
						) }
					</PanelBody>
				</Panel>
			</PluginSidebar>
		</Fragment>
	);
} );

registerPlugin( 'altis-experiments', {
	title: __( 'Experiments', 'altis-experiments' ),
	icon: createElement( PluginIcon ),
	render: Plugin,
} );
