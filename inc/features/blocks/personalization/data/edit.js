const { createBlock, cloneBlock } = wp.blocks;
const { compose } = wp.compose;
const { withSelect, withDispatch } = wp.data;

/**
 * Returns an upgraded React Component with data store connectors.
 *
 * @param {React.Component} Component
 * @return React.Component
 */
const withData = Component => compose(
	withSelect( ( select, ownProps ) => {
		const { clientId } = ownProps;
		const { getBlocks } = select( 'core/block-editor' );

		const innerBlocks = getBlocks( clientId );

		return {
			variants: innerBlocks,
		};
	} ),
	withDispatch( ( dispatch, ownProps, registry ) => {
		return {
			onAddVariant( attributes = {} ) {
				const { clientId } = ownProps;
				const { replaceInnerBlocks, selectBlock } = dispatch( 'core/block-editor' );
				const { getBlocks } = registry.select( 'core/block-editor' );

				const newVariant = createBlock( 'altis/personalization-variant', {
					audience: null,
					fallback: false,
					goal: '',
					...attributes,
				}, [] );

				// Prepend the new variant.
				const innerBlocks = [
					newVariant,
					...getBlocks( clientId ),
				];

				// Update the inner blocks.
				replaceInnerBlocks( clientId, innerBlocks );

				// Focus defaults to the newly added inner block so keep it on the parent.
				selectBlock( clientId );

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
		};
	} ),
)( Component );

export default withData;
