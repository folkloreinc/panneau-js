const path = require('path');
const glob = require('glob');
const fs = require('fs');
const webpack = require('webpack');
const getLocalIdent = require('../build/lib/getLocalIdent');
const getResolveAliases = require('../build/lib/getResolveAliases');
const getResolveModules = require('../build/lib/getResolveModules');
const getPackagesPaths = require('../build/lib/getPackagesPaths');

const CSS_NAME = 'panneau-[name]-[local]';

module.exports = (storybookBaseConfig, configType) => {

    storybookBaseConfig.resolve.alias = {
        // ...storybookBaseConfig.resolve.alias,
        jquery: require.resolve('jquery-slim'),
        'hoist-non-react-statics': path.resolve(__dirname, '../node_modules/hoist-non-react-statics'),
        ...getResolveAliases(),
    };

    storybookBaseConfig.resolve.modules = [
        ...storybookBaseConfig.resolve.modules,
        ...getResolveModules(),
    ];

    storybookBaseConfig.module.rules[0].include = [
        ...getPackagesPaths().map(it => path.join(it, 'src')),
        path.resolve(__dirname),
        path.resolve(__dirname, '../.storybook-package')
    ];
    storybookBaseConfig.module.rules[0].use[0].options.plugins.push(
        require.resolve('@babel/plugin-syntax-dynamic-import'),
        require.resolve('@babel/plugin-proposal-object-rest-spread'),
    );
    storybookBaseConfig.module.rules[0].use[0].options.cacheDirectory = true;
    storybookBaseConfig.module.rules[0].use[0].options.cacheCompression = true;
    storybookBaseConfig.module.rules[0].use[0].options.compact = true;
    // Exclude all node_modules folders
    storybookBaseConfig.module.rules[0].exclude.push(/node_modules/);

    // CSS loaders
    const styleLoader = {
        loader: 'style-loader',
        options: {
            sourceMap: true,
        },
    };

    const cssLoader = {
        loader: 'css-loader',
        options: {
            sourceMap: true,
        },
    };

    const postCssLoader = {
        loader: 'postcss-loader',
        options: {
            sourceMap: true,
            config: {
                path: path.resolve(__dirname, '../build/postcss.config.js'),
                ctx: {
                    env: 'dev',
                },
            },
        },
    };

    const sassLoader = {
        loader: 'sass-loader',
        options: {
            sourceMap: true,
            includePaths: [
                ...getResolveModules(),
            ],
        },
    };

    storybookBaseConfig.module.rules.push({
        test: /\.css$/,
        loaders: [
            styleLoader,
            cssLoader,
            postCssLoader,
        ],
    });

    storybookBaseConfig.module.rules.push({
        test: /\.global\.scss$/,
        loaders: [
            styleLoader,
            cssLoader,
            postCssLoader,
            sassLoader,
        ],
    });

    storybookBaseConfig.module.rules.push({
        test: /\.scss$/,
        exclude: /\.global\.scss$/,
        loaders: [
            styleLoader,
            {
                ...cssLoader,
                options: {
                    ...cssLoader.options,
                    modules: true,
                    importLoaders: 2,
                    // prettier-ignore
                    localIdentName: CSS_NAME,
                    getLocalIdent: (context, localIdentName, localName) => (
                        getLocalIdent(localIdentName, localName, context.resourcePath)
                    ),
                },
            },
            postCssLoader,
            sassLoader,
        ],
    });

    storybookBaseConfig.module.rules.push({
        test: /\.(ttf|eot|woff|woff2|otf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader',
        include: /fonts\//,
        options: {
            limit: 1000,
            name: 'fonts/[name]-[hash:6].[ext]',
            publicPath: '',
        },
    });

    storybookBaseConfig.plugins.push(new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development'),
        __DEV__: JSON.stringify(true),
    }));

    return storybookBaseConfig;
};
