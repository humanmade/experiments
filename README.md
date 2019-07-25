Altis AB Tests
==============

AB Testing tools for Altis.

## Features

The plugin currently provides the following built in features:

### Post titles

With this feature enabled it's simple to create AB Tests for your post titles directly from the post edit screen.

It is enabled by default but can be disabled using the following filter:

```php
add_filter( 'altis.ab_tests.features.titles', '__return_false' );
```

## Usage

The plugin provides a programmatic API to register AB tests for posts:

**`register_post_ab_test( string $test_id, array $options )`**

Sets up the test.

- `$test_id`: A unique ID for the test.
- `$options`: Configuration options for the test.
  - `rest_api_variants_field <string>`: The field name to make variants available at.
  - `rest_api_variants_type <string>`:  The data type of the variants.
  - `goal <string>`: The conversion goal event name, eg "click".
  - `goal_filter <string | callable>`: Elasticsearch bool query to filter goal results. If a callable is passed it receives the test ID and post ID as arguments.
  - `query_filter <string | callable>`: Elasticsearch bool query to filter total events being queried.
  - `variant_callback <callable>`: A callback used to render variants based. Recieves the variant value, test ID and post ID as arguments.

**`output_test_html_for_post( string $test_id, int $post_id, string $default_content, array $args = [] )`**

Returns the AB Test markup for client side processing.

- `$test_id`: A unique ID for the test.
- `$post_id`: The post ID for the test.
- `$default_content`: The default content for the control test.
- `$args`: An optional array of data to pass through to `variant_callback`.

```php
namespace Altis\AB_Tests;

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
	return output_test_html_for_post( 'featured_images', $post_id, $html, [
		'size' => $size,
		'attr' => $attr,
	] );
}, 10, 5 );
```

How you manage the variant data is up to you, for example you could use Fieldmanager or Advanced Custom Fields to create metaboxes to save variant data.

Note you should use the following functions to get and update the variants:

**`get_test_variants_for_post( string $test_id, int $post_id ) : array`**

**`update_test_variants_for_post( string $test_id, int $post_id, array $variants )`**

## Roadmap

- Multivariate test capability
- Features
  - Featured image tests

------------------

Made with ❤️ by [Human Made](https://humanmade.com/)
