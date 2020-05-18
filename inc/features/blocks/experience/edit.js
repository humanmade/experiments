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
const ALLOWED_BLOCKS = [ 'altis/experience-block-variant' ];

/**
 * Start with a default template of one variant.
 */
const TEMPLATE = [
	[ 'altis/experience-block-variant' ],
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
		variants.forEach( variant => {
			setVariantAttributes( variant.clientId, {
				parentId: clientId,
			} );
		} );
	}

	// Get the current variant name from the audience if available.
	const getVariantName = ( index ) => {
		const variant = variants[ index ];
		if ( ! variant ) {
			return sprintf( __( 'Variant %d', 'altis-experiments' ), index + 1 );
		}
		if ( ! variant.attributes.audience ) {
			return __( 'Fallback', 'altis-experiments' );
		}
		const audience = getAudience( variant.attributes.audience );
		if ( audience && audience.title && audience.title.rendered ) {
			return audience.title.rendered;
		}
		return sprintf( __( 'Variant %d', 'altis-experiments' ), index + 1 );
	}

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
									{ __( 'If no audience is selected this content will be used as a fallback.', 'altis-analytics' ) }
								</p>
							) }
						</PanelBody>
					);
				} ) }
			</InspectorControls>
			<style dangerouslySetInnerHTML={ {
				__html: `
					[data-block="${ clientId }"] [data-type="altis/experience-block-variant"] {
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
						{ __( 'Experience Block', 'altis-experiments' ) }
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
							<IconButton
								icon='trash'
								title={ __( 'Remove variant', 'altis-experiments' ) }
								disabled={ variants.length < 2 }
								onClick={ () => {
									if ( ! window.confirm( __( 'Are you sure you want to remove this variant?', 'altis-experiments' ) ) ) {
										return;
									}
									setVariant( variants[ Math.max( 0, activeVariantIndex - 1 ) ].clientId );
									removeVariant( activeVariant );
								} }
							/>
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

export default compose(
	withSelect( ( select, ownProps ) => {
		const { clientId } = ownProps;
		const { getBlocks } = select( 'core/block-editor' );
		const { getPost: getAudience } = select( 'audience' );

		const innerBlocks = getBlocks( clientId );

		// Ensure at least one variant is present.
		// Note TEMPLATE does not seem to have the desired effect every time.
		if ( innerBlocks.length === 0 ) {
			const initialVariant = createBlock( 'altis/experience-block-variant', {
				parentId: clientId,
				audience: null,
			} );
			innerBlocks.push( initialVariant );
		}

		return {
			variants: innerBlocks,
			getAudience,
		};
	} ),
	withDispatch( ( dispatch, ownProps, registry ) => {
		return {
			addVariant() {
				const { clientId, attributes } = ownProps;
				const { replaceInnerBlocks } = dispatch( 'core/block-editor' );
				const { getBlocks } = registry.select( 'core/block-editor' );

				let innerBlocks = getBlocks( clientId );

				const newVariant = createBlock( 'altis/experience-block-variant', {
					parentId: attributes.clientId,
					audience: null,
				} );

				innerBlocks = [
					...innerBlocks,
					newVariant,
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

				const fromVariant = getBlock( variantClientId );
				const newVariant = cloneBlock( fromVariant );

				const experienceBlockClientId = getBlockRootClientId( variantClientId );
				const variantBlocks = getBlocks( experienceBlockClientId );

				const innerBlocks = [
					...variantBlocks,
					newVariant,
				];

				replaceInnerBlocks( experienceBlockClientId, innerBlocks );

				return newVariant.clientId;
			},
			removeVariant( variantClientId ) {
				const { clientId } = ownProps;
				const { replaceInnerBlocks } = dispatch( 'core/block-editor' );
				const { getBlocks } = registry.select( 'core/block-editor' );

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
