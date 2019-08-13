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
		<div className="altis-experiments-date-range">
			<div className="altis-experiments-date-range__field">
				<div className="altis-experiments-date-range__label">
					<label>{ __( 'Start date', 'altis-experiments' ) }</label>
				</div>
				<TimePicker
					currentTime={ new Date( startTime ).toISOString().replace( /\.\d+Z$/, 'Z' ) }
					onChange={ time => {
						const newTime = new Date( time ).getTime();
						onChangeStart( newTime < endTime ? newTime : endTime - ( 24 * 60 * 60 * 1000 ) )
					} }
				/>
			</div>
			<div className="altis-experiments-date-range__field">
				<div className="altis-experiments-date-range__label">
					<label>{ __( 'End date', 'altis-experiments' ) }</label>
				</div>
				{ showTimeRecommendation && (
					<Notice>{ __( 'It is recommended to allow at least two weeks to achieve statistically significant results.', 'altis-experiments' ) }</Notice>
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
				<p className="altis-experiments-date-range__description description">{ description }</p>
			) }
		</div>
	);
};

export default DateRange;
