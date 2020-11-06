import React from 'react';
import Views from './views';

const { useSelect } = wp.data;

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
		<Views total={ total } isLoading={ isLoading } />
	);
};

export default BlockAnalytics;
