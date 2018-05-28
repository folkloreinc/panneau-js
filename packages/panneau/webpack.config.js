/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const webpackMerge = require('webpack-merge');
const webpackConfig = require('../../build/webpack.config.panneau');

module.exports = () => (
    webpackMerge(webpackConfig, {
        entry: {
            panneau: [
                path.join(__dirname, '../../build/polyfills'),
                path.join(__dirname, './src/path'),
                path.join(__dirname, './src/index'),
            ],
        },
    })
);
