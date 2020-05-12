import React, { useState, useEffect } from 'react';
import URLInput from './URLInput';

const { apiFetch } = wp;
const { Button } = wp.components;
const { decodeEntities } = wp.htmlEntities;
const { __ } = wp.i18n;
const { addQueryArgs } = wp.url;

/**
 * Fetches link suggestions from the API. This function is an exact copy of a function found at:
 *
 * wordpress/editor/src/components/provider/index.js
 *
 * @param {Object} search
 * @param {number} perPage
 * @return {Promise<Object[]>} List of suggestions
 */
const fetchSuggestions = async ( search, { perPage = 20 } = {} ) => {
	const posts = await apiFetch( {
		path: addQueryArgs( '/wp/v2/audiences', {
			search,
			per_page: perPage,
			status: 'publish',
		} ),
	} );

	return posts.map( post => ( {
		id: post.id,
		title: decodeEntities( post.title.rendered ) || __( '(no title)' ),
		url: '',
	} ) );
};

/**
 * Fetch a single audience by ID.
 *
 * @param {number} id An audience post ID.
 * @param {Function} callback An optional callback that receives the audience object.
 * @return {Promise<Object>} Audience post object.
 */
const fetchAudience = async ( id, callback ) => {
	const post = await apiFetch( {
		path: `/wp/v2/audiences/${ id }`,
	} );

	const audience = {
		id: post.id,
		title: decodeEntities( post.title.rendered ) || __( '(no title)' ),
		audience: post.audience,
		status: post.status,
	};

	// Allow for easy use with useEffect.
	callback && callback( audience );

	return audience;
};

const AudiencePicker = props => {
	const [ value, setValue ] = useState( '' );
	const [ selectedAudience, setAudience ] = useState( null );

	// If we have an ID and no value trigger a fetch of the audience object so
	// that external components can access the audience post data.
	useEffect( () => {
		if ( ! props.audience || value !== '' ) {
			return;
		}

		fetchAudience( props.audience, audience => {
			setAudience( audience );
			props.onSelect( audience );
		} );
	}, [ props.audience ] );

	return (
		<URLInput
			className="audience-picker-control"
			label={ props.label || '' }
			autoFocus={ props.autoFocus || false }
			placeholder={ props.placeholder || __( 'Search audiences', 'altis-experiments' ) }
			isFullWidth={ true }
			hasBorder={ true }
			__experimentalFetchLinkSuggestions={ fetchSuggestions }
			fetchLinkSuggestions={ fetchSuggestions }
			value={ value }
			onChange={ ( text, audience ) => {
				// Only update the input value when we don't receive a post object.
				if ( ! audience ) {
					setValue( text );
				}

				// Trigger select event if we receive a post object.
				if ( audience ) {
					setAudience( audience );
					if ( props.onSelect ) {
						props.onSelect( audience );
					}
				}
			} }
		>
			{ selectedAudience && (
				<p className="audience-picker-control__value">
					<strong>{ __( 'Current:' ) }</strong>
					{ ' ' }
					<span>{ selectedAudience.title }</span>
				</p>
			) }
			{ props.audience && (
				<Button
					isLink
					isDestructive
					onClick={ () => {
						setValue( '' );
						setAudience( null );

						// Allow clearing the value.
						if ( props.onClearSelection ) {
							props.onClearSelection();
						}
					} }
				>
					{ __( 'Clear selection' ) }
				</Button>
			) }
		</URLInput>
	);
};

export default AudiencePicker;
