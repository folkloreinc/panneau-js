const path = require('path');
const glob = require('glob');
const fs = require('fs');
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

module.exports = (storybookBaseConfig, configType) => {

    storybookBaseConfig.resolve.alias = {
        jquery: require.resolve('jquery-slim'),
        'hoist-non-react-statics': path.resolve(__dirname, '../node_modules/hoist-non-react-statics'),
        ...getResolveAliases(),
    };

    storybookBaseConfig.resolve.modules = [
        ...storybookBaseConfig.resolve.modules,
        ...getResolveModules(),
    ];

    storybookBaseConfig.module.rules = [
        {
            oneOf: [
                fontsLoader,
                imagesLoader,
                {
                    ...jsLoader,
                    include: [
                        ...jsLoader.include,
                        path.resolve(__dirname),
                        path.resolve(__dirname, '../.storybook-package'),
                    ],
                },
                jsDependenciesLoader,
                styleCssLoader,
                styleGlobalSassLoader,
                styleSassLoader,
            ],
        },
        ...storybookBaseConfig.module.rules.slice(1),
    ];

    storybookBaseConfig.plugins.push(new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development'),
        __DEV__: JSON.stringify(true),
    }));
    storybookBaseConfig.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));
    storybookBaseConfig.plugins.push(new webpack.IgnorePlugin(/(?!fr|en)([a-z]{2,3})/, /locale-data/));

    return storybookBaseConfig;
};
