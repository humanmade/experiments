/**
 * Utils.
 */
function isVisible( element ) {
	const rect = element.getBoundingClientRect();

	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	);
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

	get variants() {
		return JSON.parse( this.getAttribute( 'variants' ) ) || [];
	}

	get fallback() {
		return this.getAttribute( 'fallback' );
	}

	get goal() {
		return this.getAttribute( 'goal' );
	}

	connectedCallback() {
		// Extract test set by URL parameters.
		const regex = new RegExp( `(utm_campaign|set_test)=test_${ this.testIdWithPost }:(\\d+)`, 'i' );
		const url_test = unescape( window.location.search ).match( regex );
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

		// Don't process if not part of the test.
		if ( variantId === false ) {
			this.outerHTML = this.fallback;
			return;
		}

		// Get data for event listener.
		const testId = this.testId;
		const postId = this.postId;
		const parent = this.parentNode;
		const goal = this.goal.split( ':' );
		const [ eventType, selector ] = goal;

		// Get the variant content.
		const variant = this.variants[ variantId || 0 ];

		// Replace the contents of our <ab-test> element.
		this.outerHTML = variant;

		// Call goal handler on parent.
		const goalHandler = Test.goalHandlers[ eventType ] || false;
		if ( ! eventType || ! goalHandler ) {
			return;
		}

		// Get nodes to bind click handler for.
		let nodes = [ parent ];
		if ( selector ) {
			nodes = parent.querySelectorAll( selector );
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
				window.Altis.Analytics.record( eventType, {
					attributes: {
						...attributes,
						eventTestId: testId,
						eventPostId: postId,
						eventVariantId: variantId,
					},
					metrics: {
						...metrics,
					},
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
			currentTests[ testId ] < this.variants.length
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
			variantId = Math.floor( Math.random() * this.variants.length );
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
 * @param <String> name of the goal.
 * @param <Function> callback to bind an event listener.
 * @param <String[]> array of allowed node types to bind listener to.
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

class PersonalizationBlock extends HTMLElement {

	get clientId() {
		return this.getAttribute( 'client-id' );
	}

	connectedCallback() {
		// Set default styles.
		this.attachShadow( { mode: 'open' } );
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: block;
				}
			</style>
			<slot></slot>
		`;

		// Update the component content.
		this.setContent();

		// Attach a listener to update the content when audiences are changed.
		window.Altis.Analytics.on( 'updateAudiences', this.setContent );
	}

	setContent = () => {
		const audiences = window.Altis.Analytics.getAudiences() || [];

		// Track the audience for recording an event later.
		let audience = 0;

		// Find a matching template.
		for ( let index = 0; index < audiences.length; index++ ) {
			// Find the first matching audience template.
			const template = document.querySelector( `template[data-audience="${ audiences[ index ] }"][data-parent-id="${ this.clientId }"]` );
			if ( ! template ) {
				continue;
			}

			// We have a matching template, update audience and fallback value.
			audience = audiences[ index ];

			// Populate experience block content.
			const experience = template.content.cloneNode( true );
			this.innerHTML = '';
			this.appendChild( experience );
			break;
		}

		// Set fallback content if needed.
		if ( ! audience ) {
			const template = document.querySelector( `template[data-fallback][data-parent-id="${ this.clientId }"]` );
			if ( ! template ) {
				return;
			}
			const experience = template.content.cloneNode( true );
			this.innerHTML = '';
			this.appendChild( experience );
		}

		// Log an event for tracking views and audience when scrolled into view.
		let tracked = false;
		const trackView = window.addEventListener( 'scroll', () => {
			if ( ! isVisible( this ) || tracked ) {
				return;
			}

			// Prevent spamming events.
			tracked = true;

			window.removeEventListener( 'scroll', trackView );

			window.Altis.Analytics.record( 'experienceView', {
				attributes: {
					type: 'personalization',
					clientId: this.clientId,
					audience: audience,
				},
			} );
		} );
	}

}

// Expose ABTest methods.
window.Altis.Analytics.Experiments = Object.assign( {}, window.Altis.Analytics.Experiments || {}, {
	registerGoal: Test.registerGoal,
} );

// Define custom elements when analytics has loaded.
window.Altis.Analytics.onReady( () => {
	window.customElements.define( 'ab-test', ABTest );
	window.customElements.define( 'personalization-block', PersonalizationBlock );
} );

// Fire a ready event once userland API has been exported.
const readyEvent = new CustomEvent( 'altis.experiments.ready' );
window.dispatchEvent( readyEvent );
