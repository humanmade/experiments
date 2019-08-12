( async () => {
	// Set public path for dynamic chunks.
	// eslint-disable-next-line
	__webpack_public_path__ = window.Altis.Analytics.Experiments.BuildURL;

	const supportsShadowDOMV1 = ! ! HTMLElement.prototype.attachShadow;

	// Load polyfill async if needed.
	if ( ! supportsShadowDOMV1 ) {
		await import( '@webcomponents/shadydom' );
	}

	/**
	 * Custom variant element.
	 */
	class TestVariant extends HTMLElement {
		constructor() {
			super();
			const root = this.attachShadow( { mode: 'open' } );
			root.innerHTML = '<slot></slot>';
		}
	}

	/**
	 * Test element base class.
	 */
	class Test extends HTMLElement {

		storageKey = '_altis_tests';

		get testId() {
			return this.getAttribute( 'test-id' );
		}

		get postId() {
			return this.getAttribute( 'post-id' );
		}

		get testIdWithPost() {
			return `${ this.testId }_${ this.postId }`;
		}

		get trafficPercentage() {
			return this.getAttribute( 'traffic-percentage' );
		}

		get variantCount() {
			return parseInt( this.getAttribute( 'variant-count' ), 10 );
		}

		get goal() {
			return this.getAttribute( 'goal' );
		}

		constructor() {
			super();
			const root = this.attachShadow( { mode: 'open' } );
			root.innerHTML = '<slot></slot>';
		}

		connectedCallback() {
			// Extract test set by URL parameters.
			const regex = new RegExp( `(utm_campaign|set_test)=test_${ this.testIdWithPost }:(\\d+)`, 'i' );
			const url_test = window.location.search.match( regex );
			if ( url_test ) {
				this.addTestForUser( { [ this.testIdWithPost ]: parseInt( url_test[ 2 ], 10 ) } );
			}

			// Initialise component.
			this.init();
		}

		init() {
			window.console && window.console.error( 'Children of Class Test must implement an init() method.' );
		}

		getTestsForUser() {
			return JSON.parse( window.localStorage.getItem( this.storageKey ) ) || {};
		}

		addTestForUser( test ) {
			window.localStorage.setItem( this.storageKey, JSON.stringify( {
				...this.getTestsForUser(),
				...test,
			} ) );
		}

	}

	/**
	 * Custom AB Test element.
	 */
	class ABTest extends Test {

		storageKey = '_altis_ab_tests';

		init() {
			// Assign variant ID.
			const variantId = this.getVariantId();

			// Get data for event listener.
			const variantCount = this.variantCount;
			const goal = this.goal.split( ':' );
			const testId = this.testId;
			const postId = this.postId;
			const element = this;
			const data = {
				testId,
				postId,
				variantId,
				eventType: goal[ 0 ],
				selector: goal[ 1 ] || false,
			};

			// Track if we've initialised yet as slotchange can fire multiple times.
			let initialised = false;

			// Get the slot element.
			const slot = this.shadowRoot.querySelector( 'slot' );
			slot.addEventListener( 'slotchange', () => {
				let fallback = Array.from( slot.assignedElements() )
					.filter( node => node.nodeName === 'TEST-FALLBACK' );

				// Use fallback if we're not in the test.
				if ( fallback.length > 0 && variantId === false ) {
					element.outerHTML = fallback[0].innerHTML;
					return;
				}

				let variants = Array.from( slot.assignedElements() )
					.filter( node => node.nodeName === 'TEST-VARIANT' );

				// Wait for all our variants to be available.
				if ( variants.length !== variantCount && ! initialised ) {
					return;
				}

				initialised = true;

				const variant = variants[ variantId || 0 ]; // Default to control.
				const parent = element.parentNode;

				// Replace this entire <ab-test> element.
				element.outerHTML = variant.innerHTML;

				// Call goal handler on parent.
				const goalHandler = Test.goalHandlers[ goal[ 0 ] ] || false;
				if ( variantId === false || ! goal[ 0 ] || ! goalHandler ) {
					return;
				}

				// Get nodes to bind click handler for.
				let nodes = [ parent ];
				if ( data.selector ) {
					nodes = parent.querySelectorAll( data.selector );
				} else if ( goalHandler.closest.length ) {
					// Find closest allowed element.
					const allowedNodes = goalHandler.closest.map( tag => tag.toUpperCase() );
					let el = parent;
					while ( el.parentNode && allowedNodes.indexOf( el.nodeName ) < 0 ) {
						el = el.parentNode;
					}
					if ( allowedNodes.indexOf( el.nodeName ) >= 0 ) {
						nodes = [ el ];
					}
				}

				// Apply goal callback for each found node.
				nodes.forEach( node => {
					goalHandler.callback( node, ( attributes = {}, metrics = {} ) => {
						window.Altis.Analytics.record( data.eventType, {
							attributes: {
								...attributes,
								eventTestId: data.testId,
								eventPostId: data.postId,
								eventVariantId: data.variantId,
							},
							metrics: {
								...metrics,
							},
						} );
					} );
				} );
			} );
		}

		getVariantId() {
			const testId = this.testIdWithPost;
			const trafficPercentage = this.trafficPercentage;

			// Check if this user already have a variant for this test.
			const currentTests = this.getTestsForUser();
			let variantId = false;
			// Test variant can be 0 so check for not undefined and not strictly false and
			// that it's a valid index.
			if (
				typeof currentTests[ testId ] !== 'undefined' &&
				currentTests[ testId ] !== false &&
				currentTests[ testId ] < this.variantCount
			) {
				variantId = currentTests[ testId ];
			} else if ( currentTests[ testId ] === false ) {
				return variantId;
			} else {
				// Otherwise lets check the probability we should experiment on this individual.
				// That sounded weird.
				if ( Math.random() * 100 > trafficPercentage ) {
					// Exclude from this test.
					this.addTestForUser( {
						[ testId ]: false,
					} );
					return variantId;
				}
				// Add one of the variants to the cookie.
				variantId = Math.floor( Math.random() * this.variantCount );
				this.addTestForUser( {
					[ testId ]: variantId,
				} );
			}

			// Log active test variant for all events.
			if ( window.Altis && window.Altis.Analytics ) {
				window.Altis.Analytics.registerAttribute( `test_${ testId }`, variantId );
			}

			return variantId;
		}

	}

	/**
	 * Static list of goal handlers.
	 */
	Test.goalHandlers = {};

	/**
	 * Add an event handler for recording an analytics event.
	 * The event is then used to determine the goal success.
	 *
	 * Callback receives the target node and a function to record
	 * to record the event.
	 *
	 * @param
	 */
	Test.registerGoal = ( name, callback, closest = [] ) => {
		Test.goalHandlers[ name ] = {
			callback,
			closest: Array.isArray( closest ) ? closest : [ closest ],
		};
	};

	// Register built in click goal handler.
	Test.registerGoal( 'click', ( element, record ) => {
		// Collect attributes.
		const attributes = {
			elementNode: element.nodeName || '',
			elementText: element.innerText || '',
			elementClassName: element.className || '',
			elementId: element.id || '',
			elementHref: element.href || '',
		};

		// Bind handler.
		element.addEventListener( 'click', event => {
			record( Object.assign( {}, attributes, {
				targetNode: event.target.nodeName || '',
				targetText: event.target.innerText || '',
				targetClassName: event.target.className || '',
				targetId: event.target.id || '',
				targetSrc: event.target.nodeName === 'IMG' ? event.target.src : '',
			} ) );
		} );
	}, [ 'a' ] );

	// Define custom elements.
	window.customElements.define( 'test-fallback', TestVariant );
	window.customElements.define( 'test-variant', TestVariant );
	window.customElements.define( 'ab-test', ABTest );

	// Expose ABTest methods.
	window.Altis.Analytics.Experiments = Object.assign( {}, window.Altis.Analytics.Experiments || {}, {
		registerGoal: Test.registerGoal,
	} );
} )();
