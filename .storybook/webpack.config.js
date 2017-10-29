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
            path.join(process.env.PWD, './node_modules'),
        ],
    },
};

module.exports = (storybookBaseConfig, configType) => {

    storybookBaseConfig.resolve.alias = {
        '@react-panneau/form-group': path.resolve(__dirname, '../fields/form-group/src/index'),
        '@react-panneau/field-date': path.resolve(__dirname, '../fields/date/src/index'),
        '@react-panneau/field-text': path.resolve(__dirname, '../fields/text/src/index'),
        '@react-panneau/field-select': path.resolve(__dirname, '../fields/select/src/index'),
        '@react-panneau/field-locale': path.resolve(__dirname, '../fields/locale/src/index'),
        '@react-panneau/field-color': path.resolve(__dirname, '../fields/color/src/index'),
        '@react-panneau/field-code': path.resolve(__dirname, '../fields/code/src/index'),
        '@react-panneau/field-toggle': path.resolve(__dirname, '../fields/toggle/src/index'),
        '@react-panneau/field-switch': path.resolve(__dirname, '../fields/switch/src/index'),
        '@react-panneau/field-slider': path.resolve(__dirname, '../fields/slider/src/index'),
        '@react-panneau/modal-popover': path.resolve(__dirname, '../modals/popover/src/index'),
    };

    const packageJSON = require('../package.json');
    const exactPackages = [
        'lodash',
        'babel-runtime',
    ];
    Object.keys(packageJSON.dependencies).forEach((name) => {
        const aliasPath = path.resolve(__dirname, `../node_modules/${name}`)
        if (exactPackages.indexOf(name) !== -1) {
            storybookBaseConfig.resolve.alias[`${name}$`] = aliasPath;
        } else {
            storybookBaseConfig.resolve.alias[name] = aliasPath;
        }
    });

    storybookBaseConfig.module.rules[0].exclude.push(/node_modules/);

    storybookBaseConfig.module.rules.push({
        test: /\.global\.scss$/,
        loaders: [
            styleLoader,
            cssLoader,
            postCssLoader,
            sassLoader,
        ],
    });

    storybookBaseConfig.module.rules.push({
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
    });

    storybookBaseConfig.module.rules.push({
        test: /\.(ttf|eot|woff|woff2|otf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader',
        include: /fonts\//,
        options: {
            limit: 1000,
            name: 'fonts/[name]-[hash:6].[ext]',
            publicPath: '',
        },
    });

    return storybookBaseConfig;
};
