/* global wp */
import styled from 'styled-components';
import _PanelRow from './panel-row';
import _PluginIcon from './plugin-icon';

const {
	Button: DefaultButton,
	Panel: DefaultPanel,
} = wp.components;

export const Button = DefaultButton;

export const Panel = styled( DefaultPanel )`
	.components-panel__body-title {
		.components-panel__icon {
			color: #ccc;
			align-self: flex-end;
			width: 16px;
			height: 16px;
			position: absolute;
			right: 40px;
			top: 1rem;
		}
	}
`;

export const PanelRow = _PanelRow;

export const PluginIcon = _PluginIcon;

export const Notice = styled.p`
	color: #6e7b92;
`;

export const Warning = styled.p`
	&& {
		color: #d00115;
		font-style: italic;
		margin-top: 15px;
	}
`;

export const CenteredButton = styled( Button ).attrs( {
	isLarge: true,
	isPrimary: true,
} )`
	text-align: center;
	width: 100%;
	display: block;
`;

export const DestructivedButton = styled( CenteredButton ).attrs( {
	isDestructive: true,
	isDefault: false,
	isPrimary: false,
} )`
	&.is-button {
		border-color: #e2182c;
		color: #e2182c;

		&:hover {
			background: #e2182c;
			border-color: #e2182c;
			color: #fff;
		}

		&:active:enabled {
			background: #d00115;
			border-color: #d00115;
			color: #fff;
		}
	}
`;

export const StyledResults = styled.div`
	margin: 25px 0;

	h3 {
		margin-bottom: 10px;
		font-weight: 500;
	}
`;

export const Variant = styled.div.attrs( props => ( {
	className: `altis-ab-tests-variant ${ props.highlight ? 'altis-ab-tests-variant--highlight' : '' }`,
} ) )`
	margin: 25px 0;
	position: relative;

	.altis-ab-tests-variant__change {
		color: ${ props => props.highlight ? '#25865b' : 'inherit' };
	}
`;

export const PercentageChange = styled.div.attrs( {
	className: 'altis-ab-tests-variant__change',
} )`
	position: absolute;
	top: 0;
	right: 0;
	font-size: 90%;
`;
