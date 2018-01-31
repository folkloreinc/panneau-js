const path = require('path');

const BABEL_ENV = process.env.BABEL_ENV || process.env.NODE_ENV || '';
const compiling = BABEL_ENV === 'es' || BABEL_ENV === 'cjs';

const presets = [
    ['env', {
        modules: BABEL_ENV === 'cjs' ? 'commonjs' : false,
        targets: {
            browsers: [
                '> 1%',
                'last 2 versions',
            ],
        },
        useBuiltIns: true,
    }],
    'react',
];
const plugins = [
    'syntax-dynamic-import',
    ['transform-object-rest-spread', {
        useBuiltIns: true,
    }],
    ['transform-runtime', {
        helpers: true,
        polyfill: false,
        regenerator: true,
        moduleName: 'babel-runtime',
    }],
];

if (BABEL_ENV === 'dev') {
    plugins.push('react-hot-loader/babel');
} else if (BABEL_ENV === 'test') {
    plugins.push('dynamic-import-node');
    presets[0] = 'env';
}

if (compiling) {
    plugins.push(['css-modules-transform', {
        preprocessCss: path.join(__dirname, './process-scss.js'),
        extensions: ['.css', '.scss'],
        generateScopedName: path.join(__dirname, './generateScopedName.js'),
    }]);
    plugins.push([path.join(__dirname, './babel-plugin-transform-require-ignore'), {
        extensions: ['.global.scss'],
    }]);
}

module.exports = {
    presets,
    plugins,
};
