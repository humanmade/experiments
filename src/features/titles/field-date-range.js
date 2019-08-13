/* global wp */
import React from 'react';
import {
	Notice,
} from './components';

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

	const showTimeRecommendation = ( endTime - startTime ) < ( 14 * 24 * 60 * 60 * 1000 );

	return (
		<div className="altis-ab-tests-date-range">
			<div className="altis-ab-tests-date-range__field">
				<div className="altis-ab-tests-date-range__label">
					<label>{ __( 'Start date', 'altis-ab-tests' ) }</label>
				</div>
				<TimePicker
					currentTime={ new Date( startTime ).toISOString().replace( /\.\d+Z$/, 'Z' ) }
					onChange={ time => {
						const newTime = new Date( time ).getTime();
						onChangeStart( newTime < endTime ? newTime : endTime - ( 24 * 60 * 60 * 1000 ) )
					} }
				/>
			</div>
			<div className="altis-ab-tests-date-range__field">
				<div className="altis-ab-tests-date-range__label">
					<label>{ __( 'End date', 'altis-ab-tests' ) }</label>
				</div>
				{ showTimeRecommendation && (
					<Notice>{ __( 'It is recommended to allow at least two weeks to achieve statistically significant results.', 'altis-ab-tests' ) }</Notice>
				) }
				<TimePicker
					currentTime={ new Date( endTime ).toISOString().replace( /\.\d+Z$/, 'Z' ) }
					onChange={ time => {
						const newTime = new Date( time ).getTime();
						onChangeEnd( newTime > startTime ? newTime : startTime + ( 24 * 60 * 60 * 1000 ) );
					} }
				/>
			</div>
			{ description && (
				<p className="altis-ab-tests-date-range__description description">{ description }</p>
			) }
		</div>
	);
};

export default DateRange;
