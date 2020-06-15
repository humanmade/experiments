import React from 'react';
import VariantTitle from './variant-title';

const { AudiencePicker } = Altis.Analytics.components;

const { PanelBody } = wp.components;
const { useDispatch } = wp.data;
const { __ } = wp.i18n;

const VariantPanel = ( { variant } ) => {
	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );

	if ( variant.attributes.fallback ) {
		return (
			<PanelBody title={ __( 'Fallback', 'altis-experiments' ) }>
				<p className="description">
					{ __( 'This variant will be shown as a fallback if no audiences are matched. You can leave the content empty if you do not wish to show anything.', 'altis-experiments' ) }
				</p>
			</PanelBody>
		);
	}

	return (
		<PanelBody title={ <VariantTitle variant={ variant } /> }>
			<AudiencePicker
				label={ __( 'Audience' ) }
				audience={ variant.attributes.audience }
				onSelect={ audience => updateBlockAttributes( variant.clientId, { audience } ) }
				onClearSelection={ () => updateBlockAttributes( variant.clientId, { audience: null } ) }
			/>
			{ ! variant.attributes.audience && (
				<p className="description">
					{ __( 'You must select an audience for this variant.', 'altis-experiments' ) }
				</p>
			) }
		</PanelBody>
	);
};

export default VariantPanel;
