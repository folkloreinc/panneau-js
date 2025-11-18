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
        path.join(packagePath, './src/**/*.stories.@(jsx|mdx)'),
    ),
    addons: [
        // {
        //     name: '@storybook/preset-scss',
        //     options: {
        //         rule: {
        //             test: /\.module\.s[ca]ss$/,
        //         },
        //         cssLoaderOptions: {
        //             modules: {
        //                 auto: true,
        //                 namedExport: false,
        //                 localIdentName: '[path][name]__[local]--[hash:base64:5]',
        //             },
        //         },
        //     },
        // },
        // {
        //     name: '@storybook/preset-scss',
        //     options: {
        //         rule: {
        //             exclude: /\.module\.s[ca]ss$/,
        //         },
        //     },
        // },
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
                                    modules: {
                                        auto: true,
                                        namedExport: false,
                                        localIdentName: '[name]__[local]--[hash:base64:5]',
                                    },
                                },
                            },
                        ],
                    },
                    {
                        test: /\.s[ca]ss$/,
                        use: [
                            'style-loader',
                            'css-loader',
                            {
                                loader: 'sass-loader',
                                // options: { implementation: import.meta.resolve('sass') },
                            },
                        ],
                    },
                ],
            },
        },
        '@storybook/addon-docs',
    ],
    // features: {
    //     babelModeV7: true,
    // },
    webpackFinal: async (config) => {
        // Add babel-loader for JSX files
        config.module.rules.push({
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: {
                loader: require.resolve('babel-loader'),
                options: {
                    presets: [
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
            resolve: {
                ...config.resolve,
                alias: {
                    ...config.resolve.alias,
                    // '@folklore/routes': require.resolve('@folklore/routes'),
                    // 'wouter': require.resolve('wouter'),
                    // 'react-intl': require.resolve('react-intl'),
                    // '@uppy/core/css/style.css': require.resolve('@uppy/core/css/style.css'),
                    // '@uppy/core': require.resolve('@uppy/core'),
                    // '@uppy/react': require.resolve('@uppy/react'),
                    ...getPackagesAliases(),
                    // '@panneau/ckeditor': path.join(__dirname, '../packages/ckeditor/src/index'),
                    // '@panneau/ckeditor': path.join(__dirname, '../packages/ckeditor/dist/build'),
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
                                test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
                                use: ['raw-loader'],
                            },
                            {
                                test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css$/,
                                use: [
                                    {
                                        loader: 'style-loader',
                                        options: {
                                            injectType: 'singletonStyleTag',
                                            attributes: {
                                                'data-cke': true,
                                            },
                                        },
                                    },
                                    'css-loader',
                                    {
                                        loader: 'postcss-loader',
                                        options: {
                                            postcssOptions: styles.getPostCssConfig({
                                                themeImporter: {
                                                    themePath: require.resolve(
                                                        '@ckeditor/ckeditor5-theme-lark',
                                                    ),
                                                },
                                                minify: true,
                                            }),
                                        },
                                    },
                                ],
                            },
                            {
                                rules: [
                                    ...config.module.rules,

                                    // ...config.module.rules.map((rule, index) =>
                                    //     index === 0
                                    //         ? {
                                    //               ...rule,
                                    //               exclude: [rule.exclude, /@ckeditor/],
                                    //           }
                                    //         : rule,
                                    // ),
                                    // ...getPackagesPaths().map((packagePath) => ({
                                    //     loader: require.resolve('babel-loader'),
                                    //     test: /\.(js|jsx)$/,
                                    //     include: path.join(packagePath, './src/'),
                                    //     exclude: /\/node_modules\//,
                                    //     options: {
                                    //         babelrc: false,
                                    //         presets: [
                                    //             [
                                    //                 require.resolve('@babel/preset-env'),
                                    //                 {
                                    //                     loose: true,
                                    //                 },
                                    //             ],
                                    //         ],
                                    //         plugins: [
                                    //             [
                                    //                 require.resolve('babel-plugin-react-intl'),
                                    //                 {
                                    //                     ast: true,
                                    //                     extractFromFormatMessageCall: true,
                                    //                     idInterpolationPattern,
                                    //                 },
                                    //             ],
                                    //         ],
                                    //     },
                                    // })),
                                    // {
                                    //     loader: require.resolve('babel-loader'),
                                    //     test: /\.(js|jsx)$/,
                                    //     include: /\/query-string\//,
                                    //     options: {
                                    //         babelrc: false,
                                    //         plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
                                    //     },
                                    // },
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
        options: {},
    },
    docs: {
        autodocs: false,
        defaultName: 'Docs', // set to change the name of generated docs entries
    },
};
