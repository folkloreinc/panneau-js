const path = require('path');

/* eslint-disable import/no-extraneous-dependencies */
const webpackMerge = require('webpack-merge');
const webpackConfig = require('../../build/webpack.config.dist');
/* eslint-enable import/no-extraneous-dependencies */

module.exports = env => (
    webpackMerge(webpackConfig(env), {
        entry: {
            'panneau-field-date': './index',
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
