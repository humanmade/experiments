/* global wp */
import React from 'react';

const { TimePicker } = wp.components;
const { __ } = wp.i18n;

export const DateRange = props => {
	const {
		description,
		endTime = Date.now() + ( 30 * 24 * 60 * 60 * 1000 ),
		onChangeStart,
		onChangeEnd,
		startTime = Date.now(),
	} = props;

	return (
		<div className="altis-ab-tests-date-range">
			<div className="altis-ab-tests-date-range__field">
				<div className="altis-ab-tests-date-range__label">
					<label>{ __( 'Start date', 'altis-ab-tests' ) }</label>
				</div>
				<TimePicker
					currentTime={ new Date( startTime ).toISOString().replace( /\.\d+Z$/, 'Z' ) }
					onChange={ time => {
						onChangeStart( time < endTime ? time : endTime )
					} }
				/>
			</div>
			<div className="altis-ab-tests-date-range__field">
				<div className="altis-ab-tests-date-range__label">
					<label>{ __( 'End date', 'altis-ab-tests' ) }</label>
				</div>
				<TimePicker
					currentTime={ new Date( endTime ).toISOString().replace( /\.\d+Z$/, 'Z' ) }
					onChange={ time => {
						onChangeEnd( time < startTime ? time : startTime );
					} }
				/>
			</div>
			{ description && <p className="altis-ab-tests-date-range__description description">{ description }</p> }
		</div>
	);
};

export default DateRange;
