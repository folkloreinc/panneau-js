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
        // Add babel-loader for JSX files
        config.module.rules.push({
            test: /\.(j|t)sx?$/,
            exclude: /node_modules/,
            use: {
                loader: require.resolve('babel-loader'),
                options: {
                    presets: [
                        [
                            require.resolve('@babel/preset-typescript'),
                            {
                                allExtensions: true,
                                isTSX: true,
                            },
                        ],
                        require.resolve('@babel/preset-react'),
                        [
                            require.resolve('@babel/preset-env'),
                            {
                                targets: {
                                    browsers: ['last 2 versions'],
                                },
                            },
                        ],
                    ],
                    plugins: [
                        [
                            require.resolve('babel-plugin-react-compiler'),
                            {
                                // compilationMode: 'annotation',
                                logger: {
                                    logEvent(filename, event) {
                                        if (event.kind === 'CompileError') {
                                            console.error(`\nCompilation failed: ${filename}`);
                                            console.error(`Reason: ${event.detail.reason}`);

                                            if (event.detail.description) {
                                                console.error(
                                                    `Details: ${event.detail.description}`,
                                                );
                                            }

                                            if (event.detail.loc) {
                                                const { line, column } = event.detail.loc.start;
                                                console.error(
                                                    `Location: Line ${line}, Column ${column}`,
                                                );
                                            }

                                            if (event.detail.suggestions) {
                                                console.error(
                                                    'Suggestions:',
                                                    event.detail.suggestions,
                                                );
                                            }
                                        }
                                    },
                                },
                            },
                        ],
                    ],
                },
            },
        });

        // Enable CSS modules in existing Storybook CSS loaders
        config.module.rules.forEach((rule) => {
            if (rule.oneOf) {
                rule.oneOf.forEach((oneOfRule) => {
                    if (
                        oneOfRule.test &&
                        (oneOfRule.test.toString().includes('\\.css') ||
                            oneOfRule.test.toString().includes('\\.s[ac]ss'))
                    ) {
                        if (oneOfRule.use && Array.isArray(oneOfRule.use)) {
                            oneOfRule.use.forEach((loader) => {
                                if (loader.loader && loader.loader.includes('css-loader')) {
                                    if (!loader.options) {
                                        loader.options = {};
                                    }
                                    // Enable CSS modules with auto mode (only for .module.* files)
                                    loader.options.modules = {
                                        auto: true,
                                        namedExport: false,
                                        localIdentName: '[path][name]__[local]--[hash:base64:5]',
                                    };
                                }
                            });
                        }
                    }
                });
            }
        });

        return {
            ...config,
            plugins: [
                ...config.plugins,
                new webpack.ProvidePlugin({
                    React: 'react',
                }),
            ],
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
            module: {
                ...config.module,
                rules: [
                    {
                        test: /\.m?js$/,
                        resolve: {
                            fullySpecified: false,
                        },
                    },
                    {
                        oneOf: [
                            {
                                rules: [
                                    ...config.module.rules,
                                    {
                                        test: /\.(srt)$/,
                                        loader: require.resolve('file-loader'),
                                    },
                                ],
                            },
                        ],
                    },
                ],
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
