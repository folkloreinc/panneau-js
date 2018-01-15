/* eslint-disable import/no-extraneous-dependencies */
const webpackMerge = require('webpack-merge');
const webpackConfig = require('../../build/webpack.config.dist');
/* eslint-enable import/no-extraneous-dependencies */

module.exports = env => (
    webpackMerge(webpackConfig(env), {
        entry: {
            'panneau-field-core': './index',
        },
        output: {
            library: 'PanneauCoreList',
        },
    })
);
