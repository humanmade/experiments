import React from 'react';

const { InnerBlocks } = wp.blockEditor;
const { compose } = wp.compose;
const { withSelect, withDispatch } = wp.data;

const Edit = ( {
	hasChildBlocks,
	isSelected,
	selectParent,
} ) => {
	// Autofocus experience block variant parent on select.
	if ( isSelected ) {
		selectParent();
	}

	return (
		<InnerBlocks
			renderAppender={
				hasChildBlocks
					? undefined
					: () => <InnerBlocks.ButtonBlockAppender />
			}
		/>
	);
};

export default compose(
	withSelect( ( select, ownProps ) => {
		const { clientId } = ownProps;
		const { getBlockOrder } = select( 'core/block-editor' );

		return {
			hasChildBlocks: () => getBlockOrder( clientId ).length > 0,
		};
	} ),
	withDispatch( ( dispatch, ownProps, registry ) => {
		const { clientId } = ownProps;
		const { getBlockRootClientId } = registry.select( 'core/block-editor' );
		const { selectBlock } = dispatch( 'core/block-editor' );

		// Get parent block client ID.
		const rootClientId = getBlockRootClientId( clientId );

		return {
			selectParent: () => selectBlock( rootClientId ),
		};
	} ),
)( Edit );
