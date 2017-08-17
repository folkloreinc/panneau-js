const path = require('path');

module.exports = {
    module: {
        rules: [
            {
                test: /\.scss$/,
                loaders: [
                    {
                        loader: 'style-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                    {
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
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                            includePaths: [
                                './node_modules',
                            ],
                        },
                    },
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
