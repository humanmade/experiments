import React from 'react';
import Views from './views';

const { useSelect } = wp.data;

const VariantAnalytics = ( { variant } ) => {
	const { audience, fallback } = variant.attributes;

	// Show nothing if no audience selected and not the fallback.
	if ( ! fallback && ! audience ) {
		return null;
	}

	const postId = useSelect( select => {
		return select( 'core/editor' ).getCurrentPostId();
	} );

	// No post ID so post isn't published, don't show anything.
	if ( ! postId ) {
		return null;
	}

	// Get the XB variant parent client ID.
	const clientId = useSelect( select => {
		const { getBlockAttributes, getBlockRootClientId } = select( 'core/block-editor' );
		const parentClientId = getBlockRootClientId( variant.clientId );
		return getBlockAttributes( parentClientId ).clientId;
	}, [ variant.clientId ] );

	// Fetch the stats.
	const data = useSelect( select => {
		return select( 'analytics/xbs' ).getViews( clientId, postId );
	}, [ clientId, postId ] );
	const isLoading = useSelect( select => {
		return select( 'analytics/xbs' ).getIsLoading();
	}, [ data ] );

	const audienceId = audience || 0;

	// Total loads, views & conversions.
	let conversions = null;
	let conversionsDenominator = null;

	const audiences = ( data && data.audiences ) || [];
	const audienceData = audiences.find( data => data.id === audienceId ) || {};
	const total = audienceData.views;

	if ( variant.attributes.goal ) {
		conversions = audienceData.conversions;
	} else {
		conversions = audienceData.views;
		conversionsDenominator = audienceData.loads;
	}

	return (
		<Views
			isLoading={ isLoading }
			total={ total }
			conversions={ conversions }
			conversionsDenominator={ conversionsDenominator }
		/>
	);
};

export default VariantAnalytics;
