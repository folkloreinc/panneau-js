const path = require('path');
const fs = require('fs');
/* eslint-disable import/no-extraneous-dependencies */
const webpackMerge = require('webpack-merge');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const webpackConfig = require('./webpack.config.base');
/* eslint-enable import/no-extraneous-dependencies */
const getPackagesPaths = require('./lib/getPackagesPaths');

const outputPath = path.join(process.env.PWD, 'dist/');

const modules = [
    path.join(process.env.PWD, './node_modules'),
    path.join(__dirname, '../node_modules'),
    path.join(__dirname, '../fields/fields/node_modules'),
    path.join(__dirname, '../layouts/layouts/node_modules'),
    path.join(__dirname, '../lists/lists/node_modules'),
    path.join(__dirname, '../forms/forms/node_modules'),
    path.join(__dirname, '../modals/modals/node_modules'),
];
const alias = {};
const exactPackages = [
    'lodash',
    'babel-runtime',
];
getPackagesPaths().forEach((packagePath) => {
    modules.push(path.resolve(packagePath, './node_modules'));
    const packageJSON = require(path.resolve(packagePath, './package.json')); // eslint-disable-line
    alias[packageJSON.name] = path.resolve(packagePath, './src/index');
    const dependencies = []
        .concat(Object.keys(packageJSON.dependencies || {}))
        .concat(Object.keys(packageJSON.devDependencies || {}));
    dependencies.forEach((name) => {
        const aliasPath = path.resolve(__dirname, `../node_modules/${name}`);
        if (name.match(/^@panneau/) || !fs.existsSync(aliasPath)) {
            return;
        }
        if (exactPackages.indexOf(name) !== -1) {
            alias[`${name}$`] = aliasPath;
        } else {
            alias[name] = aliasPath;
        }
    });
});

module.exports = env => (
    webpackMerge(webpackConfig(env), {

        output: {
            path: outputPath,
            libraryTarget: 'umd',
            library: 'panneau',
            libraryExport: 'default',
        },

        plugins: [
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify('production'),
                __DEV__: JSON.stringify(false),
            }),
            new webpack.optimize.ModuleConcatenationPlugin(),
            new UglifyJSPlugin({
                sourceMap: true,
                uglifyOptions: {
                    beautify: false,
                    mangle: {
                        keep_fnames: true,
                    },
                    compress: {
                        warnings: false,
                    },
                    comments: false,
                },
            }),
            new webpack.SourceMapDevToolPlugin({
                filename: '[file].map',
                exclude: [/vendor\//],
            }),
        ],

        externals: [
            nodeExternals({
                whitelist: [
                    'ckeditor',
                    'react-ace',
                    /^brace/,
                    /react-dates/,
                    'moment',
                    'react-select',
                    'rc-switch',
                    'rc-slider',
                    /^@panneau\//,
                ],
            }),
        ],

        resolve: {
            alias,
            modules,
        },

    })
);
