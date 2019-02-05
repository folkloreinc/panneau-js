// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const webpackConfig = require('./webpack.config.prod');
const getResolveAliases = require('./lib/getResolveAliases');
const getResolveModules = require('./lib/getResolveModules');

module.exports = {
    ...webpackConfig,
    output: {
        ...webpackConfig.output,
        libraryTarget: 'umd',
        library: 'panneau',
        libraryExport: 'default',
    },
    resolve: {
        ...webpackConfig.resolve,
        alias: getResolveAliases(),
        modules: getResolveModules(),
    },
    externals: [],
};
