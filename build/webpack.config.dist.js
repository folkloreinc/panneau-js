/* eslint-disable import/no-extraneous-dependencies */
const webpackMerge = require('webpack-merge');
const webpack = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const webpackConfig = require('./webpack.config.base');
/* eslint-enable import/no-extraneous-dependencies */

const outputPath = path.join(process.env.PWD, 'dist/');

module.exports = env => (
    webpackMerge(webpackConfig(env), {

        output: {
            path: outputPath,
            libraryTarget: 'umd',
            library: 'Microdoc',
        },

        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('production'),
                __DEV__: JSON.stringify(false),
            }),
            new webpack.optimize.ModuleConcatenationPlugin(),
            new UglifyJSPlugin({
                beautify: false,
                sourceMap: true,
                mangle: {
                    screw_ie8: true,
                    keep_fnames: true,
                },
                compress: {
                    screw_ie8: true,
                    warnings: false,
                },
                comments: false,
            }),
            new webpack.SourceMapDevToolPlugin({
                filename: '[file].map',
                exclude: [/vendor\//],
            }),
        ],

        externals: [
            nodeExternals({
                whitelist: ['ckeditor', 'react-ace', /^brace/, /react-dates/, 'moment', 'react-select', 'rc-switch', 'rc-slider'],
            }),
        ],

    })
);
