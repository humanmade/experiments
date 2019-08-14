/* global wp */
import React from 'react';
import { Notice } from '.';

const { TimePicker } = wp.components;
const { __ } = wp.i18n;

const DateRange = props => {
	const {
		description,
		endTime,
		onChangeStart,
		onChangeEnd,
		startTime,
	} = props;

	const showTimeRecommendation = ( endTime - startTime ) < ( 14 * 24 * 60 * 60 * 1000 );

	const startDate = new Date( startTime );
	const endDate = new Date( endTime );

	return (
		<div className="altis-experiments-date-range">
			<div className="altis-experiments-date-range__field">
				<div className="altis-experiments-date-range__label">
					<label>{ __( 'Start date', 'altis-experiments' ) }</label>
				</div>
				<TimePicker
					currentTime={ startDate.toISOString() }
					onChange={ time => {
						const newDate = new Date( time );
						onChangeStart( newDate < endDate ? newDate.getTime() : endTime - ( 24 * 60 * 60 * 1000 ) )
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
					currentTime={ endDate.toISOString() }
					onChange={ time => {
						const newDate = new Date( time );
						onChangeEnd( newDate > startDate ? newDate.getTime() : startTime + ( 24 * 60 * 60 * 1000 ) );
					} }
				/>
			</div>
			{ description && (
				<p className="altis-experiments-date-range__description description">{ description }</p>
			) }
		</div>
	);
};

DateRange.defaultProps = {
	endTime: Date.now() + ( 30 * 24 * 60 * 60 * 1000 ),
	startTime: Date.now(),
};

export default DateRange;
