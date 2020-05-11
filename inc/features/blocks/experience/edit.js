import React, { Fragment, useState } from 'react';
import AudiencePicker from './components/AudiencePicker';

const {
	// AlignmentToolbar,
	BlockControls,
	InnerBlocks,
	InspectorControls,
} = wp.blockEditor;
const { createBlock } = wp.blocks;
const {
	Button,
	PanelBody,
	Toolbar,
} = wp.components;
const { compose } = wp.compose;
const { withSelect, withDispatch } = wp.data;
const { __ } = wp.i18n;

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
	removeVariant,
	setAttributes,
	setVariantAttributes,
	variants,
} ) => {

	// Track currently selected variant.
	const [ activeVariant, setVariant ] = useState( variants[ 0 ].clientId );

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

	return (
		<Fragment>
			<BlockControls>
				{ variants.map( ( variant, index ) => {
					const controls = activeVariant !== variant.clientId
						? []
						: [
							{
								icon: 'trash',
								title: __( 'Remove this variant', 'altis-experiments' ),
								isActive: false,
								onClick: () => {
									if ( !window.confirm( __( 'Are you sure you want to remove this variant?', 'altis-experiments' ) ) ) {
										return;
									}
									setVariant( variants[ 0 ].clientId );
									removeVariant( variant.clientId );
								},
							}
						];

					return (
						<Toolbar
							key={ `variant-toolbar-${ variant.clientId }` }
							className={ `altis-variant-toolbar altis-variant-toolbar--${ activeVariant === variant.clientId ? 'active' : 'inactive' }` }
							controls={ controls }
						>
							<Button
								isLink
								onClick={ () => setVariant( variant.clientId ) }
							>
								{ `${ __( 'Variant' ) } ${ index + 1 }` }
							</Button>
						</Toolbar>
					);
				} ) }
				<Toolbar
					controls={ [
						{
							icon: 'plus',
							title: __( 'Add a variant', 'altis-experiments' ),
							isActive: false,
							onClick: () => {
								const variantClientId = addVariant();
								setVariant( variantClientId );
							},
						}
					] }
				/>
			</BlockControls>
			<InspectorControls>
				{ variants.map( ( variant, index ) => {
					return (
						<PanelBody
							key={ `variant-settings-${ variant.clientId }` }
							title={ `${ __( 'Variant', 'altis-experiments' ) } ${ index + 1 }` }
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
				`
			} } />
			<div className={ className }>
				<div className="altis-experience-block-header">
					{ __( 'Experience Block', 'altis-experiments' ) }
					{ ' ・ ' }
					{ __( 'Variant', 'altis-experiments' ) }
					{ ' ' }
					{ activeVariantIndex + 1 }
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

		const innerBlocks = getBlocks( clientId );

		return {
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
			}
		};
	} )
)( Edit );
