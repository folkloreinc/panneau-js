const path = require('path');

const CSS_NAME = 'panneau-[name]-[local]';

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
        localIdentName: CSS_NAME,
    },
};

const postCssLoader = {
    loader: 'postcss-loader',
    options: {
        sourceMap: true,
        config: {
            path: path.join(process.env.PWD, './build/postcss.config.js'),
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
            './node_modules',
        ],
    },
};

module.exports = {
    devtool: 'source-map',

    module: {
        rules: [
            {
                test: /\.global\.scss$/,
                loaders: [
                    styleLoader,
                    cssLoader,
                    postCssLoader,
                    sassLoader,
                ],
                include: path.resolve(__dirname, '../src/'),
            },
            {
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
                        },
                    },
                    postCssLoader,
                    sassLoader,
                ],
                include: path.resolve(__dirname, '../src/'),
            },
            {
                test: /\.(ttf|eot|woff|woff2|otf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader',
                include: /fonts\//,
                options: {
                    limit: 1000,
                    name: 'fonts/[name]-[hash:6].[ext]',
                    publicPath: '',
                },
            },
        ],
    },
};
