const { createBlock, cloneBlock } = wp.blocks;
const { compose } = wp.compose;
const { withSelect, withDispatch } = wp.data;

/**
 * Creates a new fallback variant block within the provided experience block clientId.
 *
 * @param {String} parentId The parent experience block client ID.
 * @return The new fallback variant block.
 */
const createFallbackBlock = parentId => {
	return createBlock( 'altis/personalization-variant', {
		parentId,
		audience: null,
		fallback: true,
	} );
};

/**
 * Returns an upgraded React Component with data store connectors.
 *
 * @param {React.Component} Component
 * @return React.Component
 */
const withData = Component => compose(
	withSelect( ( select, ownProps ) => {
		const { clientId, attributes } = ownProps;
		const { getBlocks } = select( 'core/block-editor' );

		const parentClientId = attributes.clientId || clientId;
		const innerBlocks = getBlocks( clientId );

		// Ensure at least one variant is present as a fallback.
		// Note TEMPLATE does not seem to have the desired effect every time.
		if ( innerBlocks.length === 0 ) {
			const fallbackBlock = createFallbackBlock( parentClientId );
			innerBlocks.push( fallbackBlock );
		} else {
			// Add a flag to check if we have a fallback explicitly set.
			const hasFallback = innerBlocks.find( block => block.attributes.fallback );
			if ( ! hasFallback ) {
				const fallbackBlock = createFallbackBlock( parentClientId );
				innerBlocks.push( fallbackBlock );
			}
		}

		return {
			variants: innerBlocks,
		};
	} ),
	withDispatch( ( dispatch, ownProps, registry ) => {
		return {
			onAddVariant() {
				const { clientId, attributes } = ownProps;
				const { replaceInnerBlocks } = dispatch( 'core/block-editor' );
				const { getBlocks } = registry.select( 'core/block-editor' );

				const newVariant = createBlock( 'altis/personalization-variant', {
					parentId: attributes.clientId,
					audience: null,
				} );

				// Prepend the new variant.
				const innerBlocks = [
					newVariant,
					...getBlocks( clientId ),
				];

				// Update the inner blocks.
				replaceInnerBlocks( clientId, innerBlocks );

				// Return new client ID to enable selection.
				return newVariant.clientId;
			},
			onCopyVariant( variantClientId ) {
				const { replaceInnerBlocks } = dispatch( 'core/block-editor' );
				const {
					getBlock,
					getBlocks,
					getBlockRootClientId,
				} = registry.select( 'core/block-editor' );

				// Clone the the block but override the audience.
				const fromVariant = getBlock( variantClientId );
				const newVariant = cloneBlock( fromVariant, {
					audience: null,
					fallback: false,
				} );

				const experienceBlockClientId = getBlockRootClientId( variantClientId );
				const variantBlocks = getBlocks( experienceBlockClientId );
				const fromVariantIndex = variantBlocks.findIndex( variant => variant.clientId === variantClientId );

				// If we've copied the fallback then add it just before the fallback variant.
				// Otherwise add it just after the source block.
				const fromIndex = fromVariant.attributes.fallback ? fromVariantIndex : fromVariantIndex + 1;

				const nextBlocks = [
					...variantBlocks.slice( 0, fromIndex ),
					newVariant,
					...variantBlocks.slice( fromIndex ),
				];

				replaceInnerBlocks( experienceBlockClientId, nextBlocks );

				return newVariant.clientId;
			},
			onRemoveVariant( variantClientId ) {
				const { clientId, attributes } = ownProps;
				const { replaceInnerBlocks } = dispatch( 'core/block-editor' );
				const { getBlocks } = registry.select( 'core/block-editor' );

				// Prevent removal of the fallback variant.
				if ( attributes.fallback ) {
					return;
				}

				// Remove inner block by clientId.
				const innerBlocks = getBlocks( clientId ).filter( block => block.clientId !== variantClientId );

				// Update the inner blocks.
				replaceInnerBlocks( clientId, innerBlocks );
			},
			onSetClientId() {
				const { attributes, setAttributes } = ownProps;
				if ( ! attributes.clientId ) {
					setAttributes( { clientId: attributes.clientId } );
				}
			},
			onSetVariantParents() {
				const { attributes, variants } = ownProps;
				const { updateBlockAttributes } = dispatch( 'core/block-editor' );
				variants.forEach( variant => {
					if ( ! variant.attributes.parentId || variant.attributes.parentId !== attributes.clientId ) {
						updateBlockAttributes( variant.clientId, {
							parentId: attributes.clientId,
						} );
					}
				} );
			},
		};
	} ),
)( Component );

export default withData;
