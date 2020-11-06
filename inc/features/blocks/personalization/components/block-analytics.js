import React from 'react';
import Views from './views';

const { useSelect } = wp.data;
const { __ } = wp.i18n;

const BlockAnalytics = ( { clientId } ) => {
	const postId = useSelect( select => {
		return select( 'core/editor' ).getCurrentPostId();
	} );

	// No post ID so post isn't published, don't show anything.
	if ( ! postId ) {
		return null;
	}

	// Fetch the stats.
	const views = useSelect( select => {
		return select( 'analytics/xbs' ).getViews( clientId, postId );
	}, [ clientId, postId ] );
	const isLoading = useSelect( select => {
		return select( 'analytics/xbs' ).getIsLoading();
	}, [ views ] );

	const total = views?.total;

	return (
		<div className="altis-experience-block-analytics">
			<h4>{ __( 'Analytics', 'altis-experiments' ) }</h4>
			<p>{ __( 'Statisitics shown are for the configured data retention period.', 'altis-experiments' ) }</p>
			<Views total={ total } isLoading={ isLoading } />
		</div>
	);
};

export default BlockAnalytics;
