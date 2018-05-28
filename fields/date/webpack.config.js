/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const webpackMerge = require('webpack-merge');
const webpackConfig = require('../../build/webpack.config.prod');

module.exports = () => (
    webpackMerge(webpackConfig, {
        entry: {
            'panneau-field-date': [
                path.join(__dirname, '../../build/polyfills'),
                path.join(__dirname, './src/index'),
            ],
        },
        output: {
            library: 'PanneauDateField',
        },
        resolve: {
            alias: {
                'array-flatten': path.join(__dirname, '../../node_modules/array-flatten'),
            },
        },
    })
);
