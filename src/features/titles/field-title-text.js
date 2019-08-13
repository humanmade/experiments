/* global wp */
import React, { Fragment } from 'react';
import styled from 'styled-components';
import { getLetter } from './utils';

const { TextareaControl, Icon } = wp.components;
const { __ } = wp.i18n;

const Variant = styled.div`
	margin-bottom: 5px;
	position: relative;
`;

const Views = styled.div`
	font-size: 80%;
	color: #666;

	.dashicon {
		margin-right: 4px;
		vertical-align: middle;
		position: relative;
		width: 0.9rem;
		top: -1px;
	}
`;

export const TitleTextField = props => {
	const {
		onChange,
		isEditable,
		titles,
		variants,
		defaultTitle,
	} = props;

	// Add the current post title if we have no titles yet.
	if ( ! titles.length ) {
		titles.push( defaultTitle );
	}

	const setTitles = ( titles = [], title = '', index = 0, remove = false ) => {
		const newTitles = titles.slice();
		if ( remove ) {
			newTitles.splice( index, 1 );
		} else {
			newTitles[ index ] = title;
		}
		onChange( newTitles );
	};

	return (
		<Fragment>
			{ titles.map( ( title, index ) => {
				// Get variant data.
				const variant = ( variants && variants[ index ] ) || { size: 0 };

				return (
					<Variant key={ index }>
						<TextareaControl
							autoFocus={ titles.length - 1 === index }
							key={ index }
							label={ `
								${ __( 'Title', 'altis-ab-tests' ) }
								${ getLetter( index ) }
								${ index === 0 ? __( '(original)', 'altis-ab-tests' ) : '' }
							` }
							onChange={ value => setTitles( titles, value, index ) }
							onKeyUp={ event => {
								if (
									title === '' &&
									event.target.value === '' &&
									(
										( event.key && event.key === 'Backspace' ) ||
										( event.which && event.which === 8 )
									)
								) {
									setTitles( titles, '', index, true );
								}
							} }
							onFocus={ event => {
								const length = event.target.value.length * 2;
								event.target.setSelectionRange( length, length );
							} }
							placeholder={ __( 'Enter another title here.', 'altis-ab-tests' ) }
							value={ title }
							readOnly={ ! isEditable }
							rows={3}
						/>
						{ variant.size > 0 && (
							<Views>
								<Icon icon="visibility" />
								{ variant.size }
								{ ' ' }
								<span className="screen-reader-text">{ __( 'views', 'altis-ab-tests' ) }</span>
							</Views>
						) }
					</Variant>
				)
			} ) }
			{ isEditable && titles.length < 26 && (
				<TextareaControl
					autoFocus={ titles.length <= 1 }
					label={ `${ __( 'Title', 'altis-ab-tests' ) } ${ getLetter( titles.length ) }` }
					onChange={ value => setTitles( titles, value, titles.length ) }
					placeholder={ __( 'Enter another title here.', 'altis-ab-tests' ) }
					value=""
					rows={ 3 }
				/>
			) }
		</Fragment>
	);
};

export default TitleTextField;
