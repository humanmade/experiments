/* global wp */
import React, { Fragment } from 'react';
import DateRangeField from './field-date-range';
import TitleTextField from './field-title-text';
import TrafficPercentageField from './field-traffic-percentage';
import withTestData from './data';

import {
	Button,
	CenteredButton,
	DestructivedButton,
	Notice,
	PanelRow,
	Warning,
} from './components';

const { compose } = wp.compose;
const { __ } = wp.i18n;

const arrayEquals = ( array1, array2 ) =>
	array1.length === array2.length &&
	array1.every( ( value, index ) => value === array2[ index ] )

const Settings = props => {
	const {
		isSaving,
		originalTitles,
		prevTitles,
		title,
		titles,
		test,
		resetTest,
		setState,
		updateTest,
		updateTitles,
	} = props;
	const {
		paused,
		started,
		start_time: startTime,
		end_time: endTime,
		traffic_percentage: trafficPercentage,
		results = {},
	} = test;
	const {
		variants = [],
	} = results;

	// Set the initial prevTitles value if it's empty.
	if ( originalTitles.length && ! prevTitles.length ) {
		setState( { prevTitles: originalTitles } );
	}

	const setPaused = paused => {
		setState( { prevTitles: titles } );
		updateTest( { paused }, titles, true );
	};
	const startTest = () => {
		setState( { prevTitles: titles } );
		updateTest( { started: true, paused: false }, titles, true );
	};
	const resetTitles = () => {
		updateTitles( prevTitles );
	};

	return (
		<Fragment>
			<PanelRow>
				{ started && (
					<Notice>{ paused ? __( 'Your test is paused', 'altis-ab-tests' ) : __( 'Your test is running', 'altis-ab-tests' ) }</Notice>
				) }
				{ started && (
					<CenteredButton
						disabled={ titles.length < 2 }
						isBusy={ isSaving }
						onClick={ () => {
							if ( arrayEquals( titles, prevTitles ) ) {
								return setPaused( ! paused );
							}

							if ( paused && window.confirm( __( 'Are you sure? Editing the titles will reset the current test results.', 'altis-ab-tests' ) ) ) {
								return setPaused( ! paused );
							}

							setPaused( ! paused );
						} }
					>
						{ paused && __( 'Resume test', 'altis-ab-tests' ) }
						{ ! paused && __( 'Pause test', 'altis-ab-tests' ) }
					</CenteredButton>
				) }
				{ !started && (
					<CenteredButton
						disabled={ titles.length < 2 }
						isBusy={ isSaving }
						onClick={ startTest }
					>
						{ __( 'Run test', 'altis-ab-tests' ) }
					</CenteredButton>
				) }
				{ started && paused && ! arrayEquals( titles, prevTitles ) && (
					<Fragment>
						<Warning>
							{ __( 'Editing the titles now will reset the test and delete the previous results.' ) }
						</Warning>
						<Button
							isLink
							onClick={ resetTitles }
						>
							{ __( 'Undo changes', 'altis-ab-tests' ) }
						</Button>
					</Fragment>
				) }
			</PanelRow>
			<PanelRow>
				<p>{ __( 'Add multiple post titles and see which one has a higher conversion rate.', 'altis-ab-tests' ) }</p>
				<TitleTextField
					defaultTitle={ title }
					isEditable={ paused }
					onChange={ updateTitles }
					titles={ titles }
					variants={ variants }
				/>
			</PanelRow>
			<PanelRow>
				<TrafficPercentageField
					value={ trafficPercentage || 35 }
					onChange={ percent => updateTest( { traffic_percentage: percent } ) }
				/>
			</PanelRow>
			<PanelRow>
				<DateRangeField
					startTime={ startTime || Date.now() }
					endTime={ endTime || Date.now() + ( 30 * 24 * 60 * 60 * 1000 ) }
					onChangeStart={ time => updateTest( { start_time: time } ) }
					onChangeEnd={ time => updateTest( { end_time: time } ) }
					description={ __( 'The test will stop automatically when it reaches statistical significance.', 'altis-ab-tests' ) }
				/>
			</PanelRow>
			{ started && (
				<PanelRow>
					<DestructivedButton
						onClick={ () => resetTest( __( 'Are you sure you want to cancel the test?', 'altis-ab-tests' ) ) }
					>
						{ __( 'Cancel test', 'altis-ab-tests' ) }
					</DestructivedButton>
				</PanelRow>
			) }
		</Fragment>
	);
};

const SettingsWithData = compose(
	withTestData,
)( Settings );

export default SettingsWithData;
