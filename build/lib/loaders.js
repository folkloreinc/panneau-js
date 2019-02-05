const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const getPackagesPaths = require('./getPackagesPaths');
const getResolveModules = require('./getResolveModules');
const getLocalIdent = require('./getLocalIdent');

// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP === 'true';

const jsLoader = {
    test: /\.(js|jsx|mjs)$/,
    include: [
        path.resolve(process.env.PWD, './src/'),
        ...getPackagesPaths().map(packagePath => path.join(packagePath, 'src')),
    ],
    loader: require.resolve('babel-loader'),
    options: {
        presets: [path.resolve(path.join(__dirname, '../babel-preset'))],
        cacheDirectory: true,
        // Save disk space when time isn't as important
        cacheCompression: true,
        compact: true,
    },
};

const jsDependenciesLoader = {
    test: /\.(js|mjs)$/,
    include: /node_modules/,
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
};

const postCssLoader = {
    loader: require.resolve('postcss-loader'),
    options: {
        config: {
            path: path.resolve(__dirname, '../postcss.config.js'),
        },
        sourceMap: shouldUseSourceMap,
    },
};

const sassLoader = {
    loader: require.resolve('sass-loader'),
    options: {
        includePaths: [
            ...getResolveModules(),
        ],
        sourceMap: shouldUseSourceMap,
    },
};

const cssLoader = {
    loader: require.resolve('css-loader'),
    options: {
        minimize: true,
        sourceMap: shouldUseSourceMap,
    },
};

const cssModulesLoader = {
    loader: require.resolve('css-loader'),
    options: {
        sourceMap: shouldUseSourceMap,
        modules: true,
        // prettier-ignore
        getLocalIdent: (context, localIdentName, localName) => (
            getLocalIdent(localName, context.resourcePath)
        ),
    },
};

const miniCssLoader = {
    test: /\.css$/,
    loaders: [
        {
            loader: MiniCssExtractPlugin.loader,
        },
        {
            ...cssLoader,
            options: {
                ...cssLoader.options,
                importLoaders: 1,
            },
        },
        postCssLoader,
    ],
};

const miniGlobalSassLoader = {
    test: /\.global\.(scss|sass)$/,
    loaders: [
        {
            loader: MiniCssExtractPlugin.loader,
        },
        {
            ...cssLoader,
            options: {
                ...cssLoader.options,
                importLoaders: 1,
            },
        },
        postCssLoader,
        sassLoader,
    ],
    // Don't consider CSS imports dead code even if the
    // containing package claims to have no side effects.
    // Remove this when webpack adds a warning or an error for this.
    // See https://github.com/webpack/webpack/issues/6571
    sideEffects: true,
};

const miniSassLoader = {
    test: /\.(scss|sass)$/,
    exclude: /\.global\.(scss|sass)$/,
    loaders: [
        {
            loader: MiniCssExtractPlugin.loader,
        },
        {
            ...cssModulesLoader,
            options: {
                ...cssModulesLoader.options,
                importLoaders: 2,
            },
        },
        postCssLoader,
        sassLoader,
    ],
};

const styleCssLoader = {
    test: /\.css$/,
    loader: [
        'style-loader',
        {
            ...cssLoader,
            options: {
                ...cssLoader.options,
                importLoaders: 1,
            },
        },
        postCssLoader,
    ],
};

const styleGlobalSassLoader = {
    test: /\.global\.(scss|sass)$/,
    loader: [
        'style-loader',
        {
            ...cssLoader,
            options: {
                ...cssLoader.options,
                importLoaders: 1,
            },
        },
        postCssLoader,
        sassLoader,
    ],
    // Don't consider CSS imports dead code even if the
    // containing package claims to have no side effects.
    // Remove this when webpack adds a warning or an error for this.
    // See https://github.com/webpack/webpack/issues/6571
    sideEffects: true,
};

const styleSassLoader = {
    test: /\.(scss|sass)$/,
    exclude: /\.global\.(scss|sass)$/,
    loader: [
        'style-loader',
        {
            ...cssModulesLoader,
            options: {
                ...cssModulesLoader.options,
                importLoaders: 2,
            },
        },
        postCssLoader,
        sassLoader,
    ],
};

const fontsLoader = {
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
};

const imagesLoader = {
    test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
    loader: require.resolve('url-loader'),
    options: {
        limit: 10000,
        name: 'img/[name].[ext]',
        publicPath: url => url,
    },
};

const mediasLoader = {
    loader: require.resolve('file-loader'),
    // Exclude `js` files to keep "css" loader working as it injects
    // it's runtime that would otherwise processed through "file" loader.
    // Also exclude `html` and `json` extensions so they get processed
    // by webpacks internal loaders.
    exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.html\.ejs$/, /\.json$/, /\.pattern$/],
    options: {
        name: 'medias/[name].[ext]',
        publicPath: url => url,
    },
};

module.exports = {
    jsLoader,
    jsDependenciesLoader,
    postCssLoader,
    sassLoader,
    cssLoader,
    cssModulesLoader,
    miniCssLoader,
    miniGlobalSassLoader,
    miniSassLoader,
    styleCssLoader,
    styleGlobalSassLoader,
    styleSassLoader,
    fontsLoader,
    imagesLoader,
    mediasLoader,
};
