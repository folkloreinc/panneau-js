const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const contextPath = path.join(process.env.PWD, 'src/');
const outputPath = path.join(process.env.PWD, '.tmp/');
const publicPath = '/';

module.exports = (env) => {
    const CSS_FILENAME = env === 'dev' ? '[name]-[contenthash].css' : '[name].css';
    const CSS_NAME = env === 'dev' ? '[name]_[local]' : '[name]_[local]';
    const IMAGE_FILENAME = env === 'dev' ? 'img/[name]-[hash:6].[ext]' : 'img/[name].[ext]';
    const FONT_FILENAME = env === 'dev' ? 'fonts/[name]-[hash:6].[ext]' : 'fonts/[name].[ext]';
    const IMAGE_PUBLIC_PATH = env === 'dev' ? '' : '../';
    const FONT_PUBLIC_PATH = env === 'dev' ? '' : '../';

    const extractPlugin = new ExtractTextPlugin({
        filename: CSS_FILENAME,
        allChunks: true,
    });

    const cssLoaders = [
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
                        env,
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
    ];

    const cssLocalLoaders = [].concat(cssLoaders);
    cssLocalLoaders[0] = {
        loader: 'css-loader',
        options: {
            modules: true,
            sourceMap: true,
            importLoaders: 1,
            localIdentName: CSS_NAME,
        },
    };

    return {

        context: contextPath,

        entry: {},


        output: {
            path: outputPath,
            filename: '[name].js',
            chunkFilename: '[name].js',
            jsonpFunction: 'flklrJsonp',
            publicPath,
        },

        plugins: env === 'dev' ? [

        ] : [

            extractPlugin,
        ],

        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    loader: 'babel-loader',
                    exclude: [
                        path.join(__dirname, '../node_modules'),
                    ],
                    options: {
                        forceEnv: env,
                        cacheDirectory: true,
                    },
                },
                {
                    test: /react-draw\/src/,
                    loader: 'babel-loader',
                    include: [
                        path.join(__dirname, '../node_modules/react-draw'),
                    ],
                    options: {
                        forceEnv: env,
                        cacheDirectory: true,
                    },
                },
                {
                    test: /\.json$/,
                    loader: 'json-loader',
                    exclude: [
                        path.join(__dirname, '../node_modules'),
                    ],
                },
                {
                    test: /\.html$/,
                    loader: 'html-loader',
                    exclude: [
                        path.join(__dirname, '../node_modules'),
                    ],
                },
                {
                    test: /\.svg$/,
                    exclude: [
                        path.join(__dirname, '../node_modules'),
                        path.join(__dirname, '../.tmp'),
                        path.join(__dirname, '../src/img/icons'),
                    ],
                    use: [
                        `babel-loader?forceEnv=${env}&cacheDirectory`,
                        'svg-react-loader',
                    ],
                },

                {
                    test: /\.global\.s[ac]ss$/,
                    use: env === 'dev' ? ['style-loader?convertToAbsoluteUrls'].concat(cssLoaders) : extractPlugin.extract({
                        fallback: 'style-loader',
                        use: cssLoaders,
                    }),
                },

                {
                    test: /\.s[ac]ss$/,
                    exclude: /.global\.s[ac]ss$/,
                    use: env === 'dev' ? ['style-loader?convertToAbsoluteUrls'].concat(cssLocalLoaders) : extractPlugin.extract({
                        fallback: 'style-loader',
                        use: cssLocalLoaders,
                    }),
                },

                {
                    test: /\.(png|gif|jpg|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    loader: 'url-loader',
                    exclude: /fonts\//,
                    options: {
                        limit: 1000,
                        name: IMAGE_FILENAME,
                        publicPath: IMAGE_PUBLIC_PATH,
                    },
                },

                {
                    test: /\.(ttf|eot|woff|woff2|otf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    loader: 'url-loader',
                    include: /fonts\//,
                    options: {
                        limit: 1000,
                        name: FONT_FILENAME,
                        publicPath: FONT_PUBLIC_PATH,
                    },
                },
            ],
        },

        resolve: {
            extensions: ['.js', '.jsx', '.es6'],
            modules: [
                path.join(process.env.PWD, './node_modules'),
                path.join(process.env.PWD, './web_modules'),
                path.join(process.env.PWD, './bower_components'),
            ],
        },

        stats: {
            colors: true,
            modules: true,
            reasons: true,
            modulesSort: 'size',
            children: true,
            chunk: true,
            chunkModules: true,
            chunkOrigins: true,
            chunkSort: 'size',
        },

        performance: {
            maxAssetSize: 100000,
            maxEntrypointSize: 300000,
        },

        devtool: 'source-map',
        cache: true,
        watch: false,
    };
};
