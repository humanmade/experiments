/* global wp */
import deepmerge from 'deepmerge';

const { apiFetch } = wp;
const { withSelect, withDispatch } = wp.data;
const { compose, withState } = wp.compose;
const { __ } = wp.i18n;

const withTestData = compose(
	withState( {
		isSaving: false,
		prevTitles: [],
		error: false,
	} ),
	withSelect( ( select ) => {
		const ab_tests = select( 'core/editor' ).getEditedPostAttribute( 'ab_tests' );
		const test = ab_tests.titles;
		const post = select( 'core/editor' ).getCurrentPost();
		const originalTitles = select( 'core/editor' ).getCurrentPostAttribute( 'ab_test_titles' ) || [];
		const title = select( 'core/editor' ).getEditedPostAttribute( 'title' ) || '';
		const titles = select( 'core/editor' ).getEditedPostAttribute( 'ab_test_titles' ) || [];
		const currentPostType = select( 'core/editor' ).getCurrentPostType();
		const postType = select( 'core' ).getPostType( currentPostType );

		return {
			ab_tests,
			originalTitles,
			post,
			postType,
			test,
			title,
			titles,
		};
	} ),
	withDispatch( ( dispatch, props ) => {
		const { ab_tests, post, postType, setState } = props;

		const saveTest = async data => {
			setState( { isSaving: true } );

			try {
				await apiFetch( {
					path: `/wp/v2/${ postType.rest_base }/${ post.id }` +
						`?context=edit&_timestamp=${ Date.now() }`,
					method: 'PATCH',
					body: JSON.stringify( data ),
				} );
			} catch ( error ) {
				setState( { error: error } );
			}

			setState( { isSaving: false } );
		}

		const updateTest = async ( test = {}, titles = false, save = false ) => {
			const data = deepmerge( {
				ab_tests,
			}, {
				ab_tests: {
					titles: test,
				},
			} );

			if ( titles !== false ) {
				data.ab_test_titles = titles;
			}

			// Send the data to the API if we want to save it.
			if ( save ) {
				await saveTest( data );
			}

			dispatch( 'core/editor' ).editPost( data );
		};

		const updateTitles = async ( titles, save = false ) => {
			const data = {
				ab_test_titles: titles,
			};

			// Send the data to the API if we want to save it.
			if ( save ) {
				await saveTest( data );
			}

			dispatch( 'core/editor' ).editPost( data );
		};

		return {
			updateTest,
			updateTitles,
			resetTest: message => {
				if ( ! window.confirm(
					message || __( 'Are you sure you want to reset the test?', 'altis-experiments' )
				) ) {
					return;
				}

				updateTest( {
					paused: true,
					start_time: Date.now(),
					end_time: Date.now() + ( 30 * 24 * 60 * 60 * 1000 ),
					traffic_percentage: 35,
					started: false,
					results: {
						aggs: [],
						variants: [],
						winner: false,
						winning: false,
					},
				}, [], true );
			},
			saveTest,
		};
	} )
);

export default withTestData;
