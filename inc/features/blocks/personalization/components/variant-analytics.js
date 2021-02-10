import React from 'react';
import Views from './views';

const { useSelect } = wp.data;
const { _n, sprintf } = wp.i18n;

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
	const audiences = ( data && data.audiences ) || [];
	const audienceData = audiences.find( data => data.id === audienceId ) || { unique: {} };

	// Use conversions vs total views if a goal is set.
	if ( variant.attributes.goal ) {
		return (
			<Views
				conversions={ audienceData.unique.conversions }
				isLoading={ isLoading }
				total={ audienceData.unique.views }
			/>
		);
	}

	// Use page loads vs block views if no goal is set e.g. show the number of impressions.
	return (
		<Views
			conversions={ audienceData.unique.views }
			conversionsLabel={ sprintf( _n( '%d unique view', '%d unique views', audienceData.unique.views, 'altis-experiments' ), audienceData.unique.views ) }
			isLoading={ isLoading }
			label={ sprintf( _n( '%d unique page load', '%d unique page loads', audienceData.unique.loads, 'altis-experiments' ), audienceData.unique.loads ) }
			total={ audienceData.unique.loads }
		/>
	);
};

export default VariantAnalytics;
