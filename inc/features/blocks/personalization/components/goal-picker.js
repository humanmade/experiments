import React from 'react';

const { SelectControl } = wp.components;
const { __ } = wp.i18n;

const registeredGoals = window.Altis.Analytics.Experiments.Goals || {};

const GoalPicker = ( { goal, onChange } ) => {

    const goals = Object.entries( registeredGoals );

    if ( goals.length < 1 ) {
        return null;
    }

    const options = [
        { label: __( 'Impressions', 'altis-experiments' ), value: '' },
    ];

    // Add registered goals to dropdown.
    goals.forEach( ( [ name, data ] ) => {
        options.push( { label: data.label || name, value: name } );
    } );

    return (
        <SelectControl
            label={ __( 'Choose a conversion goal', 'altis-experiments' ) }
            value={ goal }
            options={ options }
            onChange={ onChange }
        />
    );
};

export default GoalPicker;