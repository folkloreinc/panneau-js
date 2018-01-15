const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpackUtils = require('./webpackUtils');

const contextPath = path.join(process.env.PWD, 'src/');
const outputPath = path.join(process.env.PWD, '.tmp/');
const publicPath = '/';

module.exports = (env) => {
    const CSS_FILENAME = env === 'dev' ? '[name]-[contenthash].css' : '[name].css';
    const CSS_NAME = env === 'dev' ? 'panneau-[name]-[local]' : 'panneau-[name]-[local]';
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
                    path: path.join(__dirname, './postcss.config.js'),
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
                    path.join(process.env.PWD, './node_modules'),
                    path.join(__dirname, '../node_modules'),
                    path.join(__dirname, '../fields/fields/node_modules'),
                    path.join(__dirname, '../layouts/layouts/node_modules'),
                    path.join(__dirname, '../lists/lists/node_modules'),
                    path.join(__dirname, '../modals/modals/node_modules'),
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
            getLocalIdent: webpackUtils.getLocalIdent,
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
                    exclude: /node_modules/,
                    options: {
                        forceEnv: env,
                        cacheDirectory: true,
                    },
                },
                {
                    test: /\.json$/,
                    loader: 'json-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.html$/,
                    loader: 'html-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.svg$/,
                    exclude: /node_modules/,
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
                path.join(__dirname, '../node_modules'),
                path.join(__dirname, '../fields/fields/node_modules'),
                path.join(__dirname, '../layouts/layouts/node_modules'),
                path.join(__dirname, '../lists/lists/node_modules'),
                path.join(__dirname, '../modals/modals/node_modules'),
            ],
        },

        stats: {
            colors: true,
            modules: true,
            reasons: true,
            modulesSort: 'size',
            children: true,
            chunks: true,
            chunkModules: true,
            chunkOrigins: true,
            chunksSort: 'size',
        },

        performance: {
            maxAssetSize: 100000,
            maxEntrypointSize: 300000,
        },

        cache: true,
        watch: false,
    };
};
