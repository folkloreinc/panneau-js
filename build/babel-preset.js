const path = require('path');

const ENV = process.env.BABEL_ENV || process.env.NODE_ENV || '';
const isCompiling = ENV === 'es' || ENV === 'cjs';
const isEs = ENV === 'es';
const isUmd = ENV === 'umd';
const isCommonJs = ENV === 'cjs';
const isTest = ENV === 'test';

const presets = [
    [require.resolve('@babel/preset-env'), isTest ? {} : {
        modules: isCommonJs ? 'commonjs' : false,
        targets: {
            ie: 9,
        },
    }],
    require.resolve('@babel/preset-react'),
];
const plugins = [
    require.resolve('@babel/plugin-syntax-dynamic-import'),
    require.resolve('@babel/plugin-proposal-object-rest-spread'),
];

if (!isUmd) {
    plugins.push(require.resolve('@babel/plugin-transform-runtime'));
}

if (isTest) {
    plugins.push(require.resolve('babel-plugin-dynamic-import-node'));
}

if (isCompiling) {
    plugins.push([require.resolve('babel-plugin-css-modules-transform'), {
        preprocessCss: path.join(__dirname, './process-scss.js'),
        extensions: ['.css', '.scss'],
        generateScopedName: path.join(__dirname, './generateScopedName.js'),
    }]);
    plugins.push([path.join(__dirname, './babel-plugin-transform-require-ignore'), {
        extensions: ['.global.scss'],
    }]);
    if (isEs) {
        plugins.push([require.resolve('babel-plugin-react-intl'), {
            messagesDir: './intl/messages/',
        }]);
    }
}

module.exports = () => ({
    presets,
    plugins,
});
