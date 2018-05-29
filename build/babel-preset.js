const path = require('path');

const ENV = process.env.BABEL_ENV || process.env.NODE_ENV || '';
const isCompiling = ENV === 'es' || ENV === 'cjs';
const isEs = ENV === 'es';
const isUmd = ENV === 'umd';
const isCommonJs = ENV === 'cjs';
const isTest = ENV === 'test';

const presets = [
    ['env', isTest ? {} : {
        modules: isCommonJs ? 'commonjs' : false,
        targets: {
            ie: 9,
        },
        useBuiltIns: isUmd,
    }],
    'react',
];
const plugins = [
    'syntax-dynamic-import',
    ['transform-object-rest-spread', {
        useBuiltIns: true,
    }],
];

if (!isUmd) {
    plugins.push(['transform-runtime', {
        helpers: true,
        polyfill: false,
        regenerator: true,
        moduleName: 'babel-runtime',
    }]);
}

if (isTest) {
    plugins.push('dynamic-import-node');
}

if (isCompiling) {
    plugins.push(['css-modules-transform', {
        preprocessCss: path.join(__dirname, './process-scss.js'),
        extensions: ['.css', '.scss'],
        generateScopedName: path.join(__dirname, './generateScopedName.js'),
    }]);
    plugins.push([path.join(__dirname, './babel-plugin-transform-require-ignore'), {
        extensions: ['.global.scss'],
    }]);
    if (isEs) {
        plugins.push(['react-intl', {
            messagesDir: './intl/messages/',
        }]);
    }
}

module.exports = {
    presets,
    plugins,
};
