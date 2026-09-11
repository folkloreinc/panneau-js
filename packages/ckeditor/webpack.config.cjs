'use strict';

const path = require('path');

module.exports = {
    entry: {
        build: './src/build.js',
    },

    output: {
        path: path.resolve(process.cwd(), 'dist'),
        filename: '[name].cjs',
        libraryTarget: 'umd',
        libraryExport: 'default',
    },

    resolve: {
        modules: [
            path.join(process.cwd(), 'node_modules'),
            path.join(process.cwd(), '../../node_modules'),
            'node_modules',
        ],
    },

    // By default webpack logs warnings if the bundle is bigger than 200kb.
    performance: { hints: false },
};
