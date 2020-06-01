const { useSelect } = wp.data;
const { __ } = wp.i18n;

// Component for fetching and displaying the variant title string.
const VariantTitle = ( { variant } ) => {
	const audience = useSelect( select => {
		return select( 'audience' ).getPost( variant.attributes.audience );
	}, [ variant.attributes.audience ] );
	const isLoading = useSelect( select => {
		return select( 'audience' ).getIsLoading();
	}, [] );

	if ( variant.attributes.fallback ) {
		return __( 'Fallback', 'altis-experiments' );
	}

	if ( ! variant.attributes.audience ) {
		return __( 'Select audience', 'altis-experiments' );
	}

	if ( audience && audience.title && audience.title.rendered ) {
		return audience.title.rendered;
	}

	if ( isLoading ) {
		return __( 'Loading...', 'altis-experiments' );
	}

	return '';
};

export default VariantTitle;
