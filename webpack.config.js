const path = require( 'path' );
const mode = process.env.NODE_ENV || 'production';
const BundleAnalyzerPlugin = require( 'webpack-bundle-analyzer' )
	.BundleAnalyzerPlugin;
const EnvironmentPlugin = require( 'webpack' ).EnvironmentPlugin;
const DynamicPublicPathPlugin = require( 'dynamic-public-path-webpack-plugin' );
const SriPlugin = require( 'webpack-subresource-integrity' );
const ManifestPlugin = require( 'webpack-manifest-plugin' );
const { CleanWebpackPlugin } = require( 'clean-webpack-plugin' );

const sharedConfig = {
	mode: mode,
	entry: {
		'features/titles': path.resolve( __dirname, 'src/features/titles/index.js' ),
		'features/blocks/personalization': path.resolve( __dirname, 'inc/features/blocks/personalization/index.js' ),
		'features/blocks/personalization-variant': path.resolve( __dirname, 'inc/features/blocks/personalization-variant/index.js' ),
		experiments: path.resolve( __dirname, 'src/experiments.js' ),
	},
	output: {
		path: path.resolve( __dirname, 'build' ),
		filename: '[name].[hash:8].js',
		chunkFilename: 'chunk.[id].[chunkhash:8].js',
		publicPath: '/',
		libraryTarget: 'this',
		jsonpFunction: 'AltisExperimentsJSONP',
		crossOriginLoading: 'anonymous',
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							require( '@babel/preset-env' ),
							require( '@babel/preset-react' ),
						],
						plugins: [
							require( '@babel/plugin-transform-runtime' ),
							require( '@babel/plugin-proposal-class-properties' ),
							require( '@wordpress/babel-plugin-import-jsx-pragma' ),
						],
					},
				},
			},
		],
	},
	optimization: {
		noEmitOnErrors: true,
	},
	plugins: [
		new EnvironmentPlugin( {
			SC_ATTR: 'altis-experiments',
		} ),
		new ManifestPlugin( {
			writeToFileEmit: true,
		} ),
		new CleanWebpackPlugin(),
	],
	externals: {
		'Altis': 'Altis',
		'wp': 'wp',
		'react': 'React',
		'react-dom': 'ReactDOM',
		'moment': 'moment',
	},
};

if ( mode === 'production' ) {
	sharedConfig.plugins.push( new DynamicPublicPathPlugin( {
		externalGlobal: 'window.Altis.Analytics.Experiments.BuildURL',
		chunkName: 'experiments',
	} ) );
	sharedConfig.plugins.push( new SriPlugin( {
		hashFuncNames: [ 'sha384' ],
		enabled: true,
	} ) );
} else {
	sharedConfig.devtool = 'cheap-module-eval-source-map';
}

if ( process.env.ANALYSE_BUNDLE ) {
	// Add bundle analyser.
	sharedConfig.plugins.push( new BundleAnalyzerPlugin() );
}

module.exports = sharedConfig;
