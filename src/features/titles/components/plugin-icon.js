/* global wp */
import React from 'react';
import withTestData from '../data';
import styled from 'styled-components';

const { compose } = wp.compose;
const { __ } = wp.i18n;

const Icon = styled.span.attrs( props => ( {
	className: props.winner ? 'has-results' : '',
} ) )`
	font-weight: bold;

	&.has-results::after {
		content: '';
		display: inline-block;
		margin-bottom: 0px;
		margin-left: 7px;
		width: .6rem;
		height: .6rem;
		border-radius: 100px;
		background: #e2182c;
		box-shadow: inset 0 0 2px rgba(0,0,0,.15);
	}
`;

const PluginIcon = props => {
	const { test } = props;
	const { results } = test || {};
	const { winner = false } = results || {};

	return (
		<Icon winner={ winner !== false }>
			{ __( 'A/B', 'altis-ab-tests' ) }
		</Icon>
	);
};

const PluginIconWithData = compose(
	withTestData
)( PluginIcon );

export default PluginIconWithData;
