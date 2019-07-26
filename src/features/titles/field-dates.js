/* global wp */
import React, { Fragment } from 'react';
import deepmerge from 'deepmerge';

const { TimePicker } = wp.components;
const { withSelect, withDispatch } = wp.data;
const { compose } = wp.compose;

export const DateRange = props => {
	const {
		description,
		label,
		setTime,
		time,
	} = props;

	return (
		<Fragment>
			<div className="altis-ab-tests-titles-label">
				<label>{ label }</label>
			</div>
			<TimePicker
				currentTime={ new Date( time ).toISOString().replace( /\.\d+Z$/, 'Z' ) }
				onChange={ value => setTime( value ) }
			/>
			{ description && <p className="description">{ description }</p> }
		</Fragment>
	);
};

export const DateRangeWithData = compose(
	withSelect( ( select, props ) => {
		const time = select( 'core/editor' )
			.getEditedPostAttribute( 'ab_tests' ).titles[ props.name ];
		return {
			time: time || props.defaultValue || Date.now(),
			ab_tests: select( 'core/editor' ).getEditedPostAttribute( 'ab_tests' ),
		};
	} ),
	withDispatch( ( dispatch, props ) => {
		return {
			setTime: time => {
				dispatch( 'core/editor' ).editPost( deepmerge( {
					ab_tests: props.ab_tests,
				}, {
					ab_tests: {
						titles: {
							[ props.name ]: new Date( time ).getTime(),
						},
					},
				} ) );
			},
		};
	} )
)( DateRange );

export default DateRangeWithData;
