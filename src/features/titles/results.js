import React, { Fragment } from 'react';

const { withSelect } = wp.data;
const { compose } = wp.compose;
const { __ } = wp.i18n;

export const Results = props => {
	const { endTime, results = {}, titles = [] } = props;
	const { winner, variants = [] } = results;

	// Ensure titles and variants are present.
	if ( !titles.length || variants.length < 2 ) {
		return null;
	}

	// Check if test has ended or we have a winner.
	const hasEnded = endTime
		? parseInt( endTime, 10 ) >= Date.now()
		: winner !== false;

	if ( !hasEnded && !winner ) {
		return null;
	}

	const control = variants[ 0 ];
	const winningVariant = variants[ winner ];
	const resultText = winner && winner > 0
		? (
			<Fragment>
				{ __( 'Your title', 'altis-ab-tests' ) }
				{ ' ' }
				<em>“{ titles[ winner - 1 ] }”</em>
				{ ' ' }
				{ __( 'performed better than the original by', 'altis-ab-tests' ) }
				{ ' ' }
				{ ( ( winningVariant.rate - control.rate ) * 100 ).toFixed( 2 ) }%
			</Fragment>
		)
		: __( 'You should keep the original post title.', 'altis-ab-tests' );

	return (
		<Fragment>
			<h3>{ __( 'Results', 'altis-ab-tests' ) }</h3>
			<p>{ resultText }</p>
		</Fragment>
	);
};

export const ResultWithData = compose(
	withSelect( select => {
		return {
			titles: select( 'core/editor' ).getCurrentPostAttribute( 'ab_test_titles' ) || [],
			results: select( 'core/editor' ).getCurrentPostAttribute( 'ab_tests' ).titles.results || {},
			endTime: select( 'core/editor' ).getCurrentPostAttribute( 'ab_tests' ).titles.end_time,
		};
	} )
)( Results );

export default ResultWithData;
