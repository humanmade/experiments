import React from 'react';

const { Icon } = wp.components;
const { __, _n, sprintf } = wp.i18n;

const Views = ( {
	conversions,
	conversionsDenominator = null,
	conversionsLabel = null,
	isLoading,
	label = null,
	total,
} ) => {
	if ( ! total && isLoading ) {
		return (
			<p className="altis-analytics-views">
				<Icon icon="visibility" />
				{ ' ' }
				{ __( 'Loading...', 'altis-experiments' ) }
			</p>
		);
	}

	if ( ! total ) {
		return (
			<p className="altis-analytics-views">
				<Icon icon="visibility" />
				{ ' ' }
				{ __( 'No views yet', 'altis-experiments' ) }
			</p>
		);
	}

	return (
		<div className="altis-analytics-views">
			<div className="altis-analytics-views__total">
				<Icon icon="visibility" />
				{ label || sprintf( _n( '%d view', '%d views', total, 'altis-experiments' ), total ) }
			</div>
			<div className="altis-analytics-views__conversions">
				<Icon icon="yes" />
				{ conversionsLabel || sprintf( _n( '%d conversion', '%d conversions', conversions, 'altis-experiments' ), conversions ) }
				{ ' ' }
				({ ( ( conversions / ( conversionsDenominator || total ) ) * 100 ).toFixed( 1 ) }%)
			</div>
		</div>
	);
};

export default Views;
