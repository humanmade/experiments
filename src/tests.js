(async () => {
	// Set public path for dynamic chunks.
	__webpack_public_path__ = window.Altis.Analytics.ABTest.BuildURL;

	const supportsShadowDOMV1 = !!HTMLElement.prototype.attachShadow;

	// Load polyfill async if needed.
	if ( ! supportsShadowDOMV1 ) {
		await import('@webcomponents/shadydom');
	}

	/**
	 * Custom variant element.
	 */
	class TestVariant extends HTMLElement {
		constructor() {
			super();
			const root = this.attachShadow({ mode: 'open' });
			root.innerHTML = `<slot></slot>`;
		}
	}

	/**
	 * Custom AB Test element.
	 */
	class ABTest extends HTMLElement {

		get testId() {
			return this.getAttribute('test-id');
		}

		get postId() {
			return this.getAttribute('post-id');
		}

		get trafficPercentage() {
			return this.getAttribute('traffic-percentage');
		}

		get goal() {
			return this.getAttribute('goal');
		}

		get variantCount() {
			return parseInt( this.getAttribute('variant-count'), 10 );
		}

		constructor() {
			super();

			const root = this.attachShadow({ mode: 'open' });

			root.innerHTML = `
			<style>
				::slotted(test-variant + test-variant) {
					display: none; visibility: hidden;
				}
			</style>
			<slot></slot>
			`;
		}

		connectedCallback() {
			// Assign variant ID.
			const variantId = this.getVariantId();

			// Get data for event listener.
			const variantCount = this.variantCount;
			const goal = this.goal.split(':');
			const testId = this.testId;
			const postId = this.postId;
			const element = this;
			const data = {
				testId,
				postId,
				variantId,
				eventType: goal[0],
				selector: goal[1] || false,
			};

			// Get the slot element.
			const slot = this.shadowRoot.querySelector( 'slot' );
			slot.addEventListener( 'slotchange', () => {
				let variants = Array.from( slot.assignedElements() )
					.filter( node => node.nodeName === 'TEST-VARIANT' );

				// Wait for all our variants to be available.
				if ( variants.length === variantCount ) {
					const variant = variants[ variantId || 0 ]; // Default to control.
					const parent = element.parentNode;

					// Replace this entire <ab-test> element.
					element.outerHTML = variant.innerHTML;

					// Call goal handler on parent.
					if ( variantId !== false && goal[0] && ABTest.goals[ goal[0] ] ) {
						ABTest.goals[ goal[0] ]( parent, data );
					}
				}
			} );
		}

		getVariantId() {
			const testId = `${this.testId}_${this.postId}`;
			const trafficPercentage = this.trafficPercentage;

			// Extract test set by campaign parameter and add for user.
			const utm_test = window.location.search.match(/utm_campaign=test_([a-z0-9_-]+):(\d+)/i);
			if ( utm_test ) {
				this.addTestForUser( { [utm_test[1]]: parseInt( utm_test[2], 10 ) } );
			}

			// Check if this user already have a variant for this test.
			const currentTests = this.getTestsForUser();
			let variantId = false;
			// Test variant can be 0 so check for not undefined and not strictly false.
			if (typeof currentTests[testId] !== 'undefined' && currentTests[testId] !== false) {
				variantId = currentTests[testId];
			} else if (currentTests[testId] === false) {
				return variantId;
			} else {
				// Otherwise lets check the probability we should experiment on this individual. That sounded weird.
				if (Math.random() * 100 > trafficPercentage) {
					// Exclude from this test.
					this.addTestForUser({
						[testId]: false
					});
					return variantId;
				}
				// Add one of the variants to the cookie.
				variantId = Math.floor(Math.random() * this.variantCount);
				this.addTestForUser({
					[testId]: variantId
				});
			}

			// Log active test variant for all events.
			if ( window.Altis && window.Altis.Analytics ) {
				window.Altis.Analytics.registerAttribute(`test_${testId}`, variantId);
			}

			return variantId;
		}

		getTestsForUser() {
			return JSON.parse(window.localStorage.getItem("_hm_tests")) || {};
		}

		addTestForUser(test) {
			window.localStorage.setItem("_hm_tests", JSON.stringify({ ...this.getTestsForUser(), ...test }));
		}

	}

	ABTest.goals = {};

	/**
	 * Add an event handler for recording an analytics event.
	 * The event is then used to determine the goal success.
	 *
	 * Callback receives the <ab-test> element's parent node and
	 * an object with the shape:
	 * {
	 *   testId: <string> The test's ID.
	 *   postId: <int> The post ID for the test.
	 *   variantId: <int> The selected variant ID.
	 *   selector: <string|null> An optional selector to bind events to child elements in the variant HTML.
	 * }
	 */
	ABTest.registerGoal = ( name, callback ) => {
		ABTest.goals[ name ] = callback;
	};

	// Register built in click goal handler.
	ABTest.registerGoal( 'click', ( element, data = {} ) => {
		// Get nodes to bind click handler for.
		let nodes = [];
		if ( data.selector ) {
			nodes = element.querySelectorAll( data.selector );
		} else {
			// Find nearest clickable element.
			const allowedNodes = [ 'A' ];
			let el = element;
			while ( el.parentNode && allowedNodes.indexOf( el.nodeName ) < 0 ) {
				el = el.parentNode;
			}
			if ( allowedNodes.indexOf( el.nodeName ) >= 0 ) {
				nodes = [ el ];
			}
		}

		// Collect attributes.
		const attributes = {
			eventTestId: data.testId,
			eventPostId: data.postId,
			eventVariantId: data.variantId,
			sourceNode: element.nodeName || '',
			sourceText: element.innerText || '',
			sourceClassName: element.className || '',
			sourceId: element.id || '',
		};

		// Bind handler.
		nodes.forEach( node => {
			node.addEventListener( 'click', event => {
				window.Altis.Analytics.record( 'click', {
					attributes: Object.assign( {}, attributes, {
						targetNode: event.target.nodeName || '',
						targetText: event.target.innerText || '',
						targetClassName: event.target.className || '',
						targetId: event.target.id || '',
						elementNode: node.nodeName || '',
						elementText: node.innerText || '',
						elementClassName: node.className || '',
						elementId: node.id || '',
						elementHref: node.href || '',
					} ),
				} );
			} );
		} );
	} );

	// Define custom elements.
	window.customElements.define( 'test-variant', TestVariant );
	window.customElements.define( 'ab-test', ABTest );

	// Expose ABTest methods.
	window.Altis.Analytics.ABTest = Object.assign( {}, window.Altis.Analytics.ABTest || {}, {
		registerGoal: ABTest.registerGoal,
	} );
})();
