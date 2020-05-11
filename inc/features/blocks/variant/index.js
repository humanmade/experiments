import edit from './edit';
import save from './save';

import blockData from './block.json';

const { registerBlockType } = wp.blocks;
const { __ } = wp.i18n;

const settings = {
	title: __( 'Experience Block Variant', 'altis-experiments' ),
	description: __( 'Personalised content block items', 'altis-experiments' ),
	edit,
	save,
	...blockData.settings,
};

// Register block.
registerBlockType( blockData.name, settings );
