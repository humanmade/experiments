import React, { Fragment, useState } from 'react';

const { AudiencePicker } = Altis.Analytics.components;

const {
	BlockControls,
	InnerBlocks,
	InspectorControls,
} = wp.blockEditor;
const { createBlock, cloneBlock } = wp.blocks;
const {
	Button,
	IconButton,
	PanelBody,
	Toolbar,
} = wp.components;
const { compose } = wp.compose;
const { withSelect, withDispatch } = wp.data;
const { sprintf, __ } = wp.i18n;

/**
 * Only variants can be direct descendents so that we can generate
 * usable markup.
 */
const ALLOWED_BLOCKS = [ 'altis/personalization-variant' ];

/**
 * Start with a default template of one variant.
 */
const TEMPLATE = [
	[ 'altis/personalization-variant' ],
];

// Audience picker input.

const Edit = ( {
	addVariant,
	attributes,
	className,
	clientId,
	copyVariant,
	getAudience,
	isSelected,
	removeVariant,
	setAttributes,
	setVariantAttributes,
	variants,
} ) => {

	// Track currently selected variant.
	const defaultVariantClientId = ( variants.length > 0 && variants[ 0 ].clientId ) || null;
	const [ activeVariant, setVariant ] = useState( defaultVariantClientId );

	// Track the active variant index to show in the title.
	const activeVariantIndex = variants.findIndex( variant => variant.clientId === activeVariant );

	// Set clientId attribute if not set.
	if ( ! attributes.clientId ) {
		setAttributes( { clientId } );
	}

	// Ensure variant data is correct parentId is correct.
	variants.forEach( variant => {
		if ( ! variant.attributes.parentId || variant.attributes.parentId !== attributes.clientId ) {
			setVariantAttributes( variant.clientId, {
				parentId: attributes.clientId,
			} );
		}
	} );

	// Get the current variant name from the audience if available.
	const getVariantName = index => {
		const variant = variants[ index ];
		if ( ! variant ) {
			return __( 'Unknown variant', 'altis-experiments' );
		}
		if ( variant.attributes.fallback ) {
			return __( 'Fallback', 'altis-experiments' )
		}
		if ( ! variant.attributes.audience ) {
			return __( 'Select audience', 'altis-experiments' );
		}
		const audience = getAudience( variant.attributes.audience );
		if ( audience && audience.title && audience.title.rendered ) {
			return audience.title.rendered;
		}
		return __( 'Loading...', 'altis-experiments' );
	};

	return (
		<Fragment>
			<BlockControls>
				<Toolbar
					className="altis-variants-toolbar"
					controls={ [
						{
							icon: 'plus',
							title: __( 'Add a variant', 'altis-experiments' ),
							className: 'altis-add-variant-button',
							onClick: () => {
								const newClientId = addVariant();
								setVariant( newClientId );
							},
						},
					] }
				>
					{ variants.map( ( variant, index ) => (
						<Button
							key={ `variant-select-${ variant.clientId }` }
							className={ `altis-variant-button components-icon-button has-text ${ activeVariant === variant.clientId && 'is-active' }` }
							title={ __( 'Select variant', 'altis-experiments' ) }
							onClick={ () => setVariant( variant.clientId ) }
						>
							{ getVariantName( index ) }
						</Button>
					) ) }
				</Toolbar>
			</BlockControls>
			<InspectorControls>
				{ variants.map( ( variant, index ) => {
					if ( variant.attributes.fallback ) {
						return (
							<PanelBody
								key={ `variant-settings-${ variant.clientId }` }
								title={ __( 'Fallback', 'altis-experiments' ) }
							>
								<p className="description">
									{ __( 'This variant will be shown as a fallback if no audiences are matched. You can leave the content empty if you do not wish to show anything.', 'altis-experiments' ) }
								</p>
							</PanelBody>
						);
					}

					return (
						<PanelBody
							key={ `variant-settings-${ variant.clientId }` }
							title={ getVariantName( index ) }
						>
							<AudiencePicker
								label={ __( 'Audience' ) }
								audience={ variant.attributes.audience }
								onSelect={ audience => {
									setVariantAttributes( variant.clientId, { audience: audience.id } );
								} }
								onClearSelection={ () => {
									setVariantAttributes( variant.clientId, { audience: null } );
								} }
							/>
							{ ! variant.attributes.audience && (
								<p className="description">
									{ __( 'You must select an audience for this variant.', 'altis-experiments' ) }
								</p>
							) }
						</PanelBody>
					);
				} ) }
			</InspectorControls>
			<style dangerouslySetInnerHTML={ {
				__html: `
					[data-block="${ clientId }"] [data-type="altis/personalization-variant"] {
						display: none;
					}
					[data-block="${ clientId }"] #block-${ activeVariant } {
						display: block;
					}
				`,
			} } />
			<div className={ className }>
				<div className="wp-core-ui altis-experience-block-header">
					<span className="altis-experience-block-header__title">
						{ __( 'Personalized Content', 'altis-experiments' ) }
						{ ' ・ ' }
						{ getVariantName( activeVariantIndex ) }
					</span>
					{ isSelected && (
						<div className="altis-experience-block-header__toolbar">
							<IconButton
								icon='migrate'
								title={ __( 'Copy variant', 'altis-experiments' ) }
								disabled={ variants.length < 1 }
								onClick={ () => {
									const newClientId = copyVariant( activeVariant );
									setVariant( newClientId );
								} }
							>
								{ __( 'Copy', 'altis-experiments' ) }
							</IconButton>
							{ activeVariant && ! variants[ activeVariantIndex ].attributes.fallback && (
								<IconButton
									icon='trash'
									title={ __( 'Remove variant', 'altis-experiments' ) }
									disabled={ variants.length < 2 }
									onClick={ () => {
										if ( activeVariantIndex === 0 ) {
											setVariant( variants[ activeVariantIndex + 1 ].clientId );
										} else {
											setVariant( variants[ activeVariantIndex - 1 ].clientId );
										}
										removeVariant( activeVariant );
									} }
								/>
							) }
						</div>
					) }
				</div>
				<InnerBlocks
					allowedBlocks={ ALLOWED_BLOCKS }
					renderAppender={ false }
					template={ TEMPLATE }
				/>
			</div>
		</Fragment>
	);
};

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

export default compose(
	withSelect( ( select, ownProps ) => {
		const { clientId, attributes } = ownProps;
		const { getBlocks } = select( 'core/block-editor' );
		const {
			getPost: getAudience,
			getIsLoading,
		} = select( 'audience' );

		const parentClientId = attributes.clientId || clientId;
		const innerBlocks = getBlocks( clientId );

		// Ensure at least one variant is present as a fallback.
		// Note TEMPLATE does not seem to have the desired effect every time.
		if ( innerBlocks.length === 0 ) {
			const fallbackBlock = createFallbackBlock( parentClientId );
			innerBlocks.push( fallbackBlock );
		} else {
			// Add a flag to check if we have a fallback explicitly set.
			let hasFallback = false;
			innerBlocks.forEach( block => {
				if ( block.attributes.fallback ) {
					hasFallback = block.clientId;
				}
			} );
			if ( ! hasFallback ) {
				const fallbackBlock = createFallbackBlock( parentClientId );
				innerBlocks.push( fallbackBlock );
			}
		}

		// Pre-fetch selected audiences for variants.
		innerBlocks.forEach( block => {
			if ( block.attributes.audience ) {
				getAudience( block.attributes.audience );
			}
		} );

		// Provide a means of determining if an audience has been deleted or not.
		const isLoading = getIsLoading();

		return {
			getAudience,
			isLoading,
			variants: innerBlocks,
		};
	} ),
	withDispatch( ( dispatch, ownProps, registry ) => {
		return {
			addVariant() {
				const { clientId, attributes } = ownProps;
				const { replaceInnerBlocks } = dispatch( 'core/block-editor' );
				const { getBlocks } = registry.select( 'core/block-editor' );

				let innerBlocks = getBlocks( clientId );

				const newVariant = createBlock( 'altis/personalization-variant', {
					parentId: attributes.clientId,
					audience: null,
				} );

				// Prepend the new variant.
				innerBlocks = [
					newVariant,
					...innerBlocks,
				];

				// Update the inner blocks.
				replaceInnerBlocks( clientId, innerBlocks );

				// Return new client ID to enable selection.
				return newVariant.clientId;
			},
			copyVariant( variantClientId ) {
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

				let innerBlocks = variantBlocks;

				// If we've copied the fallback then add it just before the fallback variant.
				// Otherwise add it just after the source block.
				if ( fromVariant.attributes.fallback ) {
					innerBlocks.splice( fromVariantIndex, 0, newVariant );
				} else {
					innerBlocks.splice( fromVariantIndex + 1, 0, newVariant );
				}

				replaceInnerBlocks( experienceBlockClientId, innerBlocks );

				return newVariant.clientId;
			},
			removeVariant( variantClientId ) {
				const { clientId, attributes } = ownProps;
				const { replaceInnerBlocks } = dispatch( 'core/block-editor' );
				const { getBlocks } = registry.select( 'core/block-editor' );

				// Prevent removal of the fallback variant.
				if ( attributes.fallback ) {
					return;
				}

				let innerBlocks = getBlocks( clientId );

				// Remove inner block by clientId.
				innerBlocks = innerBlocks.filter( block => block.clientId !== variantClientId );

				// Update the inner blocks.
				replaceInnerBlocks( clientId, innerBlocks );
			},
			setVariantAttributes( variantClientId, attributes ) {
				const { updateBlockAttributes } = dispatch( 'core/block-editor' );
				updateBlockAttributes( variantClientId, attributes );
			},
		};
	} ),
)( Edit );
