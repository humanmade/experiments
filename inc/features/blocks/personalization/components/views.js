import React from 'react';

const { Icon } = wp.components;
const { __, _n, sprintf } = wp.i18n;

const Views = ( { isLoading, label = null, total } ) => {
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
		<p className="altis-analytics-views">
			<Icon icon="visibility" />
			{ label || sprintf( _n( '%d view', '%d views', total, 'altis-experiments' ), total ) }
		</p>
	);
};

export default Views;