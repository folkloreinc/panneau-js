'use strict';

import { CKEditorTranslationsPlugin } from '@ckeditor/ckeditor5-dev-translations';
import devUtils from '@ckeditor/ckeditor5-dev-utils';
import path from 'path';

const { styles } = devUtils;

export default {
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

    plugins: [
        new CKEditorTranslationsPlugin({
            // See https://ckeditor.com/docs/ckeditor5/latest/features/ui-language.html
            language: 'fr',
            additionalLanguages: ['en'],
            //
        }),
    ],

    module: {
        rules: [
            {
                test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
                use: ['raw-loader'],
            },
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false,
                },
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
                                    themePath: '@ckeditor/ckeditor5-theme-lark',
                                },
                                minify: true,
                            }),
                        },
                    },
                ],
            },
        ],
    },

    // Useful for debugging.
    devtool: 'source-map',

    // By default webpack logs warnings if the bundle is bigger than 200kb.
    performance: { hints: false },
};
