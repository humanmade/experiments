/* global wp, moment */
import React, { Fragment } from 'react';
import withTestData from './data';
import {
	Button,
	CenteredButton,
	Notice,
	PanelRow,
	PercentageChange,
	StyledResults,
	Variant,
} from './components';

const { withDispatch } = wp.data;
const { compose } = wp.compose;
const { __ } = wp.i18n;

const letters = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase();

// Date & duration helpers.
const getDateString = date => moment( date ).format( 'MMMM D, YYYY — HH:mm' );
const getDurationString = elapsed => {
	const days = Math.floor( elapsed / ( 24 * 60 * 60 * 1000 ) );
	const hours = Math.floor( ( elapsed - ( days * ( 24 * 60 * 60 * 1000 ) ) ) / ( 60 * 60 * 1000 ) );
	const minutes = Math.floor( ( elapsed - ( days * ( 24 * 60 * 60 * 1000 ) ) - ( hours * ( 60 * 60 * 1000 ) ) ) / ( 60 * 1000 ) );
	return `${ days }d ${ hours }h ${ minutes }m`;
};

export const Results = props => {
	const {
		test = {},
		titles = [],
		resetTest,
		revertTitle,
	} = props;
	const {
		results,
		end_time: endTime,
		start_time: startTime,
		traffic_percentage: trafficPercentage,
	} = test;
	const { winner, variants = [] } = results;

	// Ensure titles and variants are present.
	if ( ! titles.length || variants.length < 2 ) {
		return null;
	}

	// Get control variant.
	const control = variants[ 0 ];

	return (
		<StyledResults>
			<PanelRow>
				<Notice>{ __( 'Your test is complete!', 'altis-ab-tests' ) }</Notice>
				<CenteredButton
					onClick={ () => resetTest() }
				>
					{ __( 'Start a new test', 'altis-ab-tests' ) }
				</CenteredButton>
			</PanelRow>
			{ titles.map( ( title, index ) => {
				// Get variant data.
				const variant = variants[ index ];
				const change = ( variant.rate - control.rate ) * 100;

				return (
					<Variant key={ index } highlight={ index === winner }>
						<h3>{ `${ __( 'Title' ) } ${ letters[ index ] }` } { index === 0 && __( '(original)', 'altis-ab-tests' ) }</h3>
						<p>{ title }</p>
						<PercentageChange>
							{ index !== 0
								? `${ change >= 0 ? '+' : '' }${ change.toFixed( 2 ) }`
								: ( variant.rate * 100 ).toFixed( 2 )
							}%
						</PercentageChange>
						{ winner === 0 && winner === index && (
							<p className="description">{ __( 'The original title performed better than the others!', 'altis-ab-tests' ) }</p>
						) }
						{ winner !== 0 && winner === index && (
							<Fragment>
								<p className="description">{ __( 'This title performed better than the others and is now the title of this post!', 'altis-ab-tests' ) }</p>
								<Button
									isLink
									onClick={ () => revertTitle() }
								>
									{ __( 'Revert to original title', 'altis-ab-tests' ) }
								</Button>
							</Fragment>
						) }
					</Variant>
				)
			} ) }

			<h3>{ __( 'Traffic Percentage', 'altis-ab-tests' ) }</h3>
			<p>{ trafficPercentage }%</p>

			<h3>{ __( 'Start Date', 'altis-ab-tests' ) }</h3>
			<p>{ getDateString( startTime ) }</p>

			<h3>{ __( 'End Date', 'altis-ab-tests' ) }</h3>
			<p>{ getDateString( endTime ) }</p>

			<h3>{ __( 'Duration', 'altis-ab-tests' ) }</h3>
			<p>{ getDurationString( endTime - startTime ) }</p>
		</StyledResults>
	);
};

export const ResultsWithData = compose(
	withTestData,
	withDispatch( ( dispatch, props ) => {
		return {
			revertTitle: () => {
				dispatch( 'core/editor' ).editPost( {
					title: props.prevTitles[ 0 ],
				} );
			}
		}
	} )
)( Results );

export default ResultsWithData;
