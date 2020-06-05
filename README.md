Altis Experiments
=================

Web Experimentation framework for Altis.

## Features

The plugin currently provides the following built in features:

### Post Title AB Tests

With this feature enabled it's simple to create AB Tests for your post titles directly from the post edit screen.

It is enabled by default but can be disabled using the following filter:

```php
add_filter( 'altis.experiments.features.titles', '__return_false' );
```

Posts and pages are supported by default however you can add support for custom post types using the following code in a plugin or your theme's `functions.php`:

```php
add_post_type_support( 'events', 'altis.experiments.titles' );
```

## Usage

The plugin provides a programmatic API to register custom AB Tests for post data:

**`register_post_ab_test( string $test_id, array $options )`**

Sets up the test.

- `$test_id`: A unique ID for the test.
- `$options`: Configuration options for the test.
  - `label <string>`: A human readable label for the test.
  - `rest_api_variants_field <string>`: The field name to make variants available at.
  - `rest_api_variants_type <string>`:  The data type of the variants.
  - `goal <string>`: The conversion goal event name, eg "click" or "click:.selector a".
  - `goal_filter <string | callable>`: Elasticsearch bool query to filter goal results. If a callable is passed it receives the test ID and post ID as arguments.
  - `query_filter <string | callable>`: Elasticsearch bool query to filter total events being queried. If a callable is passed it receives the test ID and post ID as arguments.
  - `variant_callback <callable>`: An optional callback used to render variants based. Arguments:
    - `$value <mixed>`: The variant value.
    - `$post_id <int>`: The post ID.
    - `$args <array>`: Optional args passed to `output_ab_test_html_for_post()`.
  - `winner_callback <callable>`: An optional callback used to perform updates to the post when a winner is found. Defaults to no-op. Arguments:
    - `$post_id <int>`: The post ID
    - `$value <mixed>`: The winning variant value.
  - `post_types <array>`: An array of supported post types for the test.

**`output_ab_test_html_for_post( string $test_id, int $post_id, string $default_content, array $args = [] )`**

Returns the AB Test markup for client side processing.

- `$test_id`: A unique ID for the test.
- `$post_id`: The post ID for the test.
- `$default_content`: The default content for users not in the test.
- `$args`: An optional array of data to pass through to `variant_callback`.

```php
namespace Altis\Experiments;

// Register the test.
register_post_ab_test( 'featured_images', [
	'rest_api_variants_type' => 'integer',
	'goal' => 'click',
	'variant_callback' => function ( $attachment_id, $post_id, $args ) {
		return wp_get_attachment_image(
			$attachment_id,
			$args['size'],
			false,
			$args['attr']
		);
	}
] );

// Apply the test by filtering some standard output.
add_filter( 'post_thumbnail_html', function ( $html, $post_id, $post_thumbnail_id, $size, $attr ) {
	return output_ab_test_html_for_post( 'featured_images', $post_id, $html, [
		'size' => $size,
		'attr' => $attr,
	] );
}, 10, 5 );
```

### Goal Tracking

Conversion goals are how it is determined whether a variant has been successful or not. This is calculated as the `number of conversions / number of impressions`.

The `click` goal handler is provided out of the box and adds a click event handler to the nearest `<a>` tag.

#### Scoped Event Handling

For tests where more complex alternative HTML is being rendered you can define the event target with a CSS selector passed to `element.querySelectorAll()`.

For example setting the goal to `click:.my-target` will track a conversion when the element in the variant HTML matching `.my-target` is clicked. This applies for all registered goal handlers.

#### Custom Goal Handlers

You can define your own goal handlers in JavaScript:

**`Altis.Analytics.Experiments.registerGoal( name <string>, callback <function>, closest <array> )`**

This function adds a goal handler where `name` corresponds to the value of `$options['goal']` when registering an AB Test.

The callback receives the following parameters:

- `element <HTMLElement>`: Target node for the event.
- `record <function>`: Receives the target element and a callback to log the conversion. The function accepts two optional arguments:
  - `attributes <object>`: Custom atttributes to record with the event.
  - `metrics <object>`: Custom metrics to record with the event.

The `closest` parameter allows you to ensure the element passed to your callback is of a certain type, achieved by stepping up through the DOM tree, for example to return only anchor tags you would pass `[ 'a' ]`.

```js
Altis.Analytics.Experiments.registerGoal( 'scrollIntoView', function ( element, record ) {
	var listener = function () {
		// Check element has come into view or not.
		if ( element.getBoundingClientRect().top > window.innerHeight ) {
			return;
		}

		// Remove event listener immediately.
		window.removeEventListener( 'scroll', listener );

		// Record event.
		record();
	};

	// Start listening to scroll events.
	window.addEventListener( 'scroll', listener );
} );
```

**Note:** This JavaScript should be enqueued in the `<head>` via the `wp_enqueue_scripts` action.

## Creating your own tests

How you manage the variant data is up to you, for example you could use Fieldmanager or Advanced Custom Fields to create metaboxes to save the variant data.

Note you should use the following functions to get and update the variants:

**`get_ab_test_variants_for_post( string $test_id, int $post_id ) : array`**

**`update_ab_test_variants_for_post( string $test_id, int $post_id, array $variants )`**

## Roadmap

- Multivariate testing capability
- Features
  - Featured image tests

------------------

Made with ❤️ by [Human Made](https://humanmade.com/)
