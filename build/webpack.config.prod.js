/* eslint-disable no-console */

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const safePostCssParser = require('postcss-safe-parser');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const getLocalIdent = require('./lib/getLocalIdent');
const getClientEnvironment = require('./env');
const getPackagesPaths = require('./lib/getPackagesPaths');
const getResolveModules = require('./lib/getResolveModules');
const getExternalsWhitelist = require('./lib/getExternalsWhitelist');

const srcPath = path.join(process.env.PWD, './src');
const cssFilename = '[name].css';
const cssChunkFilename = '[name]-[contenthash:8].chunk.css';
const cssRegex = /\.css$/;
const sassRegex = /\.global\.(scss|sass)$/;
const sassModuleRegex = /\.(scss|sass)$/;

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = '/';
// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
const shouldUseRelativeAssetPaths = publicPath === './';
// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP === 'true';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
const publicUrl = publicPath.slice(0, -1);
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl);

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env.stringified['process.env'].NODE_ENV !== '"production"') {
    throw new Error('Production builds must have NODE_ENV=production.');
}

// Options for PostCSS as we reference these options twice
// Adds vendor prefixing based on your specified browser support in
// package.json
const postCSSLoaderOptions = {
    config: {
        path: path.join(__dirname, './postcss.config.js'),
        ctx: {
            env,
        },
    },
    sourceMap: shouldUseSourceMap,
};

// common function to get style loaders
const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: Object.assign(
                {},
                shouldUseRelativeAssetPaths ? { publicPath: '../../' } : undefined,
            ),
        },
        {
            loader: require.resolve('css-loader'),
            options: cssOptions,
        },
        {
            loader: require.resolve('postcss-loader'),
            options: postCSSLoaderOptions,
        },
    ];
    if (preProcessor) {
        loaders.push({
            loader: require.resolve(preProcessor),
            options: {
                sourceMap: shouldUseSourceMap,
                includePaths: [...getResolveModules()],
            },
        });
    }
    return loaders;
};

// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.
module.exports = {
    mode: 'production',
    // Don't attempt to continue if there are any errors.
    bail: true,
    // We generate sourcemaps in production. This is slow but gives good results.
    // You can exclude the *.map files from the build during deployment.
    devtool: shouldUseSourceMap ? 'source-map' : false,

    output: {
        // The build folder.
        path: path.join(process.env.PWD, './dist/'),
        // Generated JS file names (with nested folders).
        // There will be one main bundle, and one file per asynchronous chunk.
        // We don't currently advertise code splitting but Webpack supports it.
        filename: '[name].js',
        // There are also additional JS chunk files if you use code splitting.
        chunkFilename: '[name].chunk.js',
        // We inferred the "public path" (such as / or /my-project) from homepage.
        publicPath,
    },

    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    parse: {
                        // we want terser to parse ecma 8 code. However, we don't want it
                        // to apply any minfication steps that turns valid ecma 5 code
                        // into invalid ecma 5 code. This is why the 'compress' and 'output'
                        // sections only apply transformations that are ecma 5 safe
                        // https://github.com/facebook/create-react-app/pull/4234
                        ecma: 8,
                    },
                    compress: {
                        ecma: 5,
                        warnings: false,
                        // Disabled because of an issue with Uglify breaking seemingly valid code:
                        // https://github.com/facebook/create-react-app/issues/2376
                        // Pending further investigation:
                        // https://github.com/mishoo/UglifyJS2/issues/2011
                        comparisons: false,
                        // Disabled because of an issue with Terser breaking valid code:
                        // https://github.com/facebook/create-react-app/issues/5250
                        // Pending futher investigation:
                        // https://github.com/terser-js/terser/issues/120
                        inline: 2,
                    },
                    mangle: {
                        safari10: true,
                    },
                    output: {
                        ecma: 5,
                        comments: false,
                        // Turned on because emoji and regex is not minified properly using default
                        // https://github.com/facebook/create-react-app/issues/2488
                        ascii_only: true,
                    },
                },
                // Use multi-process parallel running to improve the build speed
                // Default number of concurrent runs: os.cpus().length - 1
                parallel: true,
                // Enable file caching
                cache: true,
                sourceMap: shouldUseSourceMap,
            }),
            new OptimizeCSSAssetsPlugin({
                cssProcessorOptions: {
                    parser: safePostCssParser,
                    map: shouldUseSourceMap
                        ? {
                            // `inline: false` forces the sourcemap to be output into a
                            // separate file
                            inline: false,
                            // `annotation: true` appends the sourceMappingURL to the end of
                            // the css file, helping the browser find the sourcemap
                            annotation: true,
                        }
                        : false,
                },
            }),
        ],
        // Automatically split vendor and commons
        // https://twitter.com/wSokra/status/969633336732905474
        // https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
        splitChunks: {
            chunks: 'async',
            name: false,
        },
        // Keep the runtime chunk seperated to enable long term caching
        // https://twitter.com/wSokra/status/969679223278505985
        runtimeChunk: false,
    },

    resolve: {
        // This allows you to set a fallback for where Webpack should look for modules.
        // We placed these paths second because we want `node_modules` to "win"
        // if there are any conflicts. This matches Node resolution mechanism.
        // https://github.com/facebookincubator/create-react-app/issues/253
        modules: [
            ...getResolveModules(),
            ...process.env.NODE_PATH.split(path.delimiter).filter(Boolean),
        ],
        // These are the reasonable defaults supported by the Node ecosystem.
        // We also include JSX as a common component filename extension to support
        // some tools, although we do not recommend using it, see:
        // https://github.com/facebookincubator/create-react-app/issues/290
        // `web` extension prefixes have been added for better support
        // for React Native Web.
        extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx'],
        alias: {
            // Support React Native Web
            // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
            'react-native': 'react-native-web',
            jquery: require.resolve('jquery-slim'),
        },
        plugins: [
            // Adds support for installing with Plug'n'Play, leading to faster installs and adding
            // guards against forgotten dependencies and such.
            PnpWebpackPlugin,
        ],
    },

    resolveLoader: {
        plugins: [
            // Also related to Plug'n'Play, but this time it tells Webpack to load its loaders
            // from the current package.
            PnpWebpackPlugin.moduleLoader(module),
        ],
    },

    module: {
        strictExportPresence: true,
        rules: [
            // Disable require.ensure as it's not a standard language feature.
            { parser: { requireEnsure: false } },

            // First, run the linter.
            // It's important to do this before Babel processes the JS.
            {
                test: /\.(js|mjs|jsx)$/,
                enforce: 'pre',
                use: [
                    {
                        options: {
                            formatter: require.resolve('react-dev-utils/eslintFormatter'),
                            eslintPath: require.resolve('eslint'),
                        },
                        loader: require.resolve('eslint-loader'),
                    },
                ],
                include: srcPath,
            },
            {
                // "oneOf" will traverse all following loaders until one will
                // match the requirements. When no loader matches it will fall
                // back to the "file" loader at the end of the loader list.
                oneOf: [
                    // "url" loader works just like "file" loader but it also embeds
                    // assets smaller than specified size as data URLs to avoid requests.
                    {
                        test: [
                            /\.woff$/,
                            /\.woff2$/,
                            /\.otf$/,
                            /\.ttf$/,
                            /\.otf$/,
                            /\.eot$/,
                            /\.svg$/,
                        ],
                        include: [/\/fonts\//, /\/webfonts\//],
                        loader: require.resolve('file-loader'),
                        options: {
                            limit: 10000,
                            name: 'fonts/[name].[ext]',
                            publicPath: url => url,
                        },
                    },

                    {
                        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
                        loader: require.resolve('url-loader'),
                        options: {
                            limit: 10000,
                            name: 'img/[name].[ext]',
                            publicPath: url => url,
                        },
                    },

                    // Process JS with Babel.
                    {
                        test: /\.(js|jsx|mjs)$/,
                        include: [path.resolve(process.env.PWD, './src/')],
                        loader: require.resolve('babel-loader'),
                        options: {
                            compact: true,
                        },
                    },
                    {
                        test: /\.(js|jsx|mjs)$/,
                        include: [
                            ...getPackagesPaths().map(packagePath => path.join(packagePath, 'src')),
                        ],
                        loader: require.resolve('babel-loader'),
                        options: {
                            presets: [path.resolve(path.join(__dirname, './babel-preset'))],
                            cacheDirectory: true,
                            // Save disk space when time isn't as important
                            cacheCompression: true,
                            compact: true,
                        },
                    },
                    {
                        test: /\.(js|mjs)$/,
                        exclude: /@babel(?:\/|\\{1,2})runtime/,
                        loader: require.resolve('babel-loader'),
                        options: {
                            babelrc: false,
                            configFile: false,
                            compact: false,
                            presets: [
                                [
                                    require.resolve('babel-preset-react-app/dependencies'),
                                    { helpers: true },
                                ],
                            ],
                            cacheDirectory: true,
                            // Save disk space when time isn't as important
                            cacheCompression: true,
                            // If an error happens in a package, it's possible to be
                            // because it was compiled. Thus, we don't want the browser
                            // debugger to show the original code. Instead, the code
                            // being evaluated would be much more helpful.
                            sourceMaps: false,
                        },
                    },
                    // The notation here is somewhat confusing.
                    // "postcss" loader applies autoprefixer to our CSS.
                    // "css" loader resolves paths in CSS and adds assets as dependencies.
                    // "style" loader normally turns CSS into JS modules injecting <style>,
                    // but unlike in development configuration, we do something different.
                    // `ExtractTextPlugin` first applies the "postcss" and "css" loaders
                    // (second argument), then grabs the result CSS and puts it into a
                    // separate file in our build process. This way we actually ship
                    // a single CSS file in production instead of JS code injecting <style>
                    // tags. If you use code splitting, however, any async bundles will still
                    // use the "style" loader inside the async code so CSS from them won't be
                    // in the main CSS file.
                    // By default we support CSS Modules with the extension .module.css
                    {
                        test: cssRegex,
                        loader: getStyleLoaders({
                            importLoaders: 1,
                            minimize: true,
                            sourceMap: shouldUseSourceMap,
                        }),
                        // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
                    },
                    // Opt-in support for SASS. The logic here is somewhat similar
                    // as in the CSS routine, except that "sass-loader" runs first
                    // to compile SASS files into CSS.
                    // By default we support SASS Modules with the
                    // extensions .module.scss or .module.sass
                    {
                        test: sassRegex,
                        loader: getStyleLoaders(
                            {
                                importLoaders: 2,
                                sourceMap: shouldUseSourceMap,
                            },
                            'sass-loader',
                        ),
                        // Don't consider CSS imports dead code even if the
                        // containing package claims to have no side effects.
                        // Remove this when webpack adds a warning or an error for this.
                        // See https://github.com/webpack/webpack/issues/6571
                        sideEffects: true,
                    },
                    // Adds support for CSS Modules, but using SASS
                    // using the extension .module.scss or .module.sass
                    {
                        test: sassModuleRegex,
                        exclude: sassRegex,
                        loader: getStyleLoaders(
                            {
                                importLoaders: 2,
                                sourceMap: shouldUseSourceMap,
                                modules: true,
                                localIdentName: 'panneau-[name]-[local]',
                                // prettier-ignore
                                getLocalIdent: (context, localIdentName, localName) => (
                                    getLocalIdent(localIdentName, localName, context.resourcePath)
                                ),
                            },
                            'sass-loader',
                        ),
                        // Note: this won't work without `new ExtractTextPlugin()` in `plugins`.
                    },
                    // "file" loader makes sure assets end up in the `build` folder.
                    // When you `import` an asset, you get its filename.
                    // This loader doesn't use a "test" so it will catch all modules
                    // that fall through the other loaders.
                    {
                        loader: require.resolve('file-loader'),
                        // Exclude `js` files to keep "css" loader working as it injects
                        // it's runtime that would otherwise processed through "file" loader.
                        // Also exclude `html` and `json` extensions so they get processed
                        // by webpacks internal loaders.
                        exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.html\.ejs$/, /\.json$/],
                        options: {
                            name: 'medias/[name].[ext]',
                            publicPath: url => url,
                        },
                    },
                    // ** STOP ** Are you adding a new loader?
                    // Make sure to add the new loader(s) before the "file" loader.
                ],
            },
        ],
    },
    plugins: [
        // Makes some environment variables available to the JS code, for example:
        // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
        // It is absolutely essential that NODE_ENV was set to production here.
        // Otherwise React will be compiled in the very slow development mode.
        new webpack.DefinePlugin(env.stringified),
        // This gives some necessary context to module not found errors, such as
        // the requesting resource.
        new ModuleNotFoundPlugin(srcPath),
        // Makes some environment variables available to the JS code, for example:
        // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
        // It is absolutely essential that NODE_ENV was set to production here.
        // Otherwise React will be compiled in the very slow development mode.
        new webpack.DefinePlugin(env.stringified),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: cssFilename,
            chunkFilename: cssChunkFilename,
        }),
        // Moment.js is an extremely popular library that bundles large locale files
        // by default due to how Webpack interprets its code. This is a practical
        // solution that requires the user to opt into importing specific locales.
        // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
        // You can remove this if you don't use Moment.js:
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        // Ignore react-intl locale except fr and en
        new webpack.IgnorePlugin(/(?!fr|en)([a-z]{2,3})/, /locale-data/),
    ],
    externals: [
        // nodeExternals({
        //     whitelist: [
        //         'ckeditor',
        //         'react-ace',
        //         /^brace/,
        //         /react-dates/,
        //         'moment',
        //         'react-select',
        //         'rc-switch',
        //         'rc-slider',
        //         /^core-js/,
        //         /^regenerator-runtime/,
        //         'babel-polyfill',
        //     ],
        // }),
        nodeExternals({
            whitelist: [
                ...getExternalsWhitelist(),
                /^core-js(\/.*)$/,
                /^raf(\/.*)$/,
                /^promise(\/.*)$/,
                'object-assign',
                'whatwg-fetch',
            ],
        }),
    ],
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
    },
    // Turn off performance processing because we utilize
    // our own hints via the FileSizeReporter
    performance: false,
};
