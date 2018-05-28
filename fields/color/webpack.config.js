/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const webpackMerge = require('webpack-merge');
const webpackConfig = require('../../build/webpack.config.prod');

module.exports = () => (
    webpackMerge(webpackConfig, {
        entry: {
            'panneau-field-color': [
                path.join(__dirname, '../../build/polyfills'),
                path.join(__dirname, './src/index'),
            ],
        },
        output: {
            library: 'PanneauColorField',
        },
    })
);
