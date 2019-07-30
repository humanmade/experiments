const path = require( 'path' );
const mode = process.env.NODE_ENV || 'production';
const BundleAnalyzerPlugin = require( 'webpack-bundle-analyzer' )
	.BundleAnalyzerPlugin;
const EnvironmentPlugin = require( 'webpack' ).EnvironmentPlugin;

const sharedConfig = {
	mode: mode,
	entry: {
		'features/titles': path.resolve( __dirname, 'src/features/titles/index.js' ),
		experiments: path.resolve( __dirname, 'src/experiments.js' ),
	},
	output: {
		path: path.resolve( __dirname, 'build' ),
		filename: '[name].js',
		chunkFilename: '[name].chunk.js',
		publicPath: '.',
		libraryTarget: 'this',
		jsonpFunction: 'AltisABTestsJSONP',
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
			SC_ATTR: 'altis-ab-tests',
		} ),
	],
	devtool:
		mode === 'production'
			? 'cheap-module-source-map'
			: 'cheap-module-eval-source-map',
	externals: {
		'Altis': 'Altis',
		'wp': 'wp',
		'react': 'React',
		'react-dom': 'ReactDOM',
	},
};

if ( process.env.ANALYSE_BUNDLE ) {
	// Add bundle analyser.
	sharedConfig.plugins.push( new BundleAnalyzerPlugin() );
}

module.exports = sharedConfig;
