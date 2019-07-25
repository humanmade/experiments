import React, { Fragment } from 'react';
import styled from 'styled-components';

const { TextControl } = wp.components;
const { withSelect, withDispatch } = wp.data;
const { compose } = wp.compose;
const { __ } = wp.i18n;

const Variant = styled.div`
margin-bottom: 5px;
position: relative;
`;

const PercentageChange = styled.div`
position: absolute;
top: 0;
right: 0;
font-size: 90%;
`;

export const TitleTextField = props => {
	const { results, titles, setTitles, paused } = props;
	const { variants } = results;

	const finalVariants = new Array( titles.length + 1 )
		.fill( { rate: 0.0 } )
		.map( ( variant, id ) => Object.assign( {}, variant, ( variants && variants[ id ] ) || {} ) );
	const control = finalVariants[ 0 ];

	return (
		<Fragment>
			{ titles.map( ( title, index ) => {
				// Get variant data.
				const variantId = index + 1;
				const variant = finalVariants[ variantId ];
				const change = ( variant.rate - control.rate ) * 100;

				return (
					<Variant key={ index }>
						<TextControl
							autoFocus={ titles.length - 1 === index }
							key={ index }
							label={ `${ __( 'Title ' ) } ${ index + 1 }` }
							onChange={ value => setTitles( titles, value, index ) }
							onKeyUp={ event => {
								if (
									title === '' &&
									event.target.value === '' &&
									( ( event.key && event.key === 'Backspace' ) || ( event.which && event.which === 8 ) )
								) {
									setTitles( titles, '', index, true );
								}
							} }
							placeholder={ __( 'Enter your title here.', 'altis-ab-tests' ) }
							value={ title }
							readOnly={ !paused }
						/>
						<PercentageChange>
							{ `${ change >= 0 ? '+' : '' }${ change.toFixed( 2 ) }` }%
						</PercentageChange>
					</Variant>
				)
			} ) }
			{ paused && <TextControl
				label={ __( 'New title', 'altis-ab-tests' ) }
				onChange={ value => setTitles( titles, value, titles.length ) }
				placeholder={ __( 'Enter your title here.', 'altis-ab-tests' ) }
				value=""
			/> }
		</Fragment>
	);
};

export const TitleTextFieldWithData = compose(
	withSelect( select => {
		return {
			titles: select( 'core/editor' ).getEditedPostAttribute( 'ab_test_titles' ) || [],
			results: select( 'core/editor' ).getCurrentPostAttribute( 'ab_tests' ).titles.results || {},
			paused: select( 'core/editor' ).getEditedPostAttribute( 'ab_tests' ).titles.paused,
		};
	} ),
	withDispatch( dispatch => {
		return {
			setTitles: ( titles = [], title = '', index = 0, remove = false ) => {
				const newTitles = titles.slice();
				if ( remove ) {
					newTitles.splice( index, 1 );
				} else {
					newTitles[ index ] = title;
				}
				dispatch( 'core/editor' ).editPost( {
					ab_test_titles: newTitles
				} );
			}
		};
	} )
)( TitleTextField );

export default TitleTextFieldWithData;
