// Minifiers
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ExtractSass = new ExtractTextPlugin({
	filename: "css/[name].css"
});

// Global
const production = process.env.NODE_ENV === 'production';
const path = require('path');
const webpack = require('webpack');

// Other
const ProjectPath = path.resolve(__dirname, 'media');
const NodeModulesPath = path.resolve(__dirname, 'node_modules');
const jsonImporter = require('node-sass-json-importer');
const tsConfigJson = require('./tsconfig.json');
const { CheckerPlugin, TsConfigPathsPlugin } = require('awesome-typescript-loader');

function get_plugins() {
	var plugins = [];

	// Promise and Fetch Polyfill
	plugins.push(new webpack.ProvidePlugin({
		fetch: 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
	}));

	// Awesome Typescript loader
	plugins.push(new CheckerPlugin());

	// Extract CSS
	plugins.push(ExtractSass);

	// Node Modules Root
	plugins.push(new webpack.LoaderOptionsPlugin({
		options: {
			root: NodeModulesPath
		}
	}));

	if (production) {
		plugins.push(new webpack.optimize.UglifyJsPlugin({
			sourceMap: true
		}));
	}

	return plugins;
}

module.exports = {
	devtool: 'source-map',
	entry: {
		// demo: path.resolve(ProjectPath, 'ts/demo.ts'),
	},
	output: {
		filename: 'js/[name].js',
		sourceMapFilename: "js/[name].js.map",
		path: path.resolve(__dirname, 'media'),
		publicPath: path.resolve(__dirname, 'media')
	},
	resolve: {
		modules: [NodeModulesPath, ProjectPath],
		extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.scss'],
		plugins: [
			new TsConfigPathsPlugin(tsConfigJson)
		]
	},
	module: {
		rules: [
			{ test: /\.tsx?$/, use: 'awesome-typescript-loader' },
			{ test: /\.json$/, use: 'json-loader' },
			{ test: /\.hbs/, use: 'handlebars-template-loader' },
			{
				test: /\.scss$/,
				enforce: "pre",
				use: 'import-glob-loader'
			},
			{
				test: /\.scss$/,
				use: ExtractSass.extract({
					fallback: 'style-loader',
					use: [{
						loader: 'css-loader',
						options: {
							importer: jsonImporter,
							sourceMap: true,
							minimize: production,
							url: false
						}
					}, {
						loader: 'sass-loader',
						options: {
							importer: jsonImporter,
							sourceMap: true,
							minimize: production
						}
					}]
				})
			}
		]
	},
	plugins: get_plugins()
}