/* eslint-disable no-param-reassign */
const path = require('path');
const { styles } = require('@ckeditor/ckeditor5-dev-utils');
const webpack = require('webpack'); // eslint-disable-line no-unused-vars
const getPackagesPaths = require('../scripts/lib/getPackagesPaths');
const getPackagesAliases = require('../scripts/lib/getPackagesAliases');
// const { idInterpolationPattern } = require('../packages/intl/scripts/config');
require('dotenv').config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // insecure

module.exports = {
    stories: getPackagesPaths().map((packagePath) =>
        path.join(packagePath, './src/**/*.stories.@(jsx|mdx|tsx)'),
    ),
    addons: [
        {
            name: '@storybook/addon-styling-webpack',
            options: {
                rules: [
                    // Replaces existing CSS rules to support CSS Modules
                    {
                        test: /\.css$/,
                        use: [
                            'style-loader',
                            {
                                loader: 'css-loader',
                                options: {
                                    importLoaders: 1,
                                    modules: {
                                        auto: true,
                                        namedExport: false,
                                        localIdentName: '[name]__[local]--[hash:base64:5]',
                                    },
                                },
                            },
                            {
                                // Gets options from `postcss.config.js` in your project root
                                loader: 'postcss-loader',
                            },
                        ],
                    },
                ],
            },
        },
        '@storybook/addon-docs',
        '@storybook/addon-webpack5-compiler-swc',
    ],
    // features: {
    //     babelModeV7: true,
    // },
    webpackFinal: async (config) => {
        config.module.rules.push({
            test: /\.(j|t)sx?$/,
            exclude: /node_modules/,
            use: {
                loader: require.resolve('babel-loader'),
                options: {
                    babelrc: false,
                    configFile: path.join(__dirname, '../babel.config.js'),
                },
            },
        });

        config.module.rules.push({
            test: /\.(srt)$/,
            loader: require.resolve('file-loader'),
        });

        return {
            ...config,
            resolve: {
                ...config.resolve,
                alias: {
                    ...config.resolve.alias,
                    ...getPackagesAliases(),
                    '@panneau/ckeditor/build': path.join(
                        __dirname,
                        '../packages/ckeditor/src/build',
                    ),
                },
            },
        };
    },
    framework: {
        name: '@storybook/react-webpack5',
        options: {
            builder: {
                useSWC: true,
            },
        },
    },
    swc: () => ({
        jsc: {
            transform: {
                react: {
                    runtime: 'automatic',
                },
            },
        },
    }),
    docs: {
        autodocs: false,
        defaultName: 'Docs', // set to change the name of generated docs entries
    },
};
