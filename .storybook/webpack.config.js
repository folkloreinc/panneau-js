const path = require('path');
const glob = require('glob');
const fs = require('fs');
const uniq = require('lodash/uniq');
const webpack = require('webpack');
const {
    jsLoader,
    jsDependenciesLoader,
    styleCssLoader,
    styleGlobalSassLoader,
    styleSassLoader,
    fontsLoader,
    imagesLoader,
    mediasLoader,
} = require('../build/lib/loaders');
const getLocalIdent = require('../build/lib/getLocalIdent');
const getResolveAliases = require('../build/lib/getResolveAliases');
const getResolveModules = require('../build/lib/getResolveModules');
const getPackagesPaths = require('../build/lib/getPackagesPaths');

module.exports = ({ config }) => {

    config.resolve.alias = {
        ...config.resolve.alias,
        jquery: require.resolve('jquery-slim'),
        'hoist-non-react-statics': path.join(__dirname, '../node_modules/hoist-non-react-statics'),
        'react-router$': path.join(__dirname, '../node_modules/react-router'),
        'react-redux$': path.join(__dirname, '../node_modules/react-redux'),
        'react-intl$': path.join(__dirname, '../node_modules/react-intl'),
        'react$': path.join(__dirname, '../node_modules/react'),
        'react-dom$': path.join(__dirname, '../node_modules/react-dom'),
        ...getResolveAliases(),
    };

    config.module.rules = [
        {
            oneOf: [
                {
                    ...jsLoader,
                    include: [
                        ...jsLoader.include,
                        path.resolve(__dirname),
                        path.resolve(__dirname, '../.storybook-package'),
                    ],
                },
                jsDependenciesLoader,
                styleGlobalSassLoader,
                styleSassLoader,
            ],
        },
        ...config.module.rules.slice(1),
    ];

    config.plugins.push(new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development'),
        __DEV__: JSON.stringify(true),
    }));
    config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));
    config.plugins.push(new webpack.IgnorePlugin(/(?!fr|en)([a-z]{2,3})/, /locale-data/));

    return config;
};
