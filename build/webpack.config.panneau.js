/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const fs = require('fs');
const webpackConfig = require('./webpack.config.prod');
const getPackagesPaths = require('./lib/getPackagesPaths');

const modules = [
    path.join(process.env.PWD, './node_modules'),
    path.join(__dirname, '../node_modules'),
    path.join(__dirname, '../fields/fields/node_modules'),
    path.join(__dirname, '../layouts/layouts/node_modules'),
    path.join(__dirname, '../lists/lists/node_modules'),
    path.join(__dirname, '../forms/forms/node_modules'),
    path.join(__dirname, '../modals/modals/node_modules'),
];
const alias = {};
const exactPackages = [
    'lodash',
    'babel-runtime',
];
getPackagesPaths().forEach((packagePath) => {
    modules.push(path.resolve(packagePath, './node_modules'));
    const packageJSON = require(path.resolve(packagePath, './package.json')); // eslint-disable-line
    alias[packageJSON.name] = path.resolve(packagePath, './src/index');
    const dependencies = []
        .concat(Object.keys(packageJSON.dependencies || {}))
        .concat(Object.keys(packageJSON.devDependencies || {}));
    dependencies.forEach((name) => {
        const aliasPath = path.resolve(__dirname, `../node_modules/${name}`);
        if (name.match(/^@panneau/) || !fs.existsSync(aliasPath)) {
            return;
        }
        if (exactPackages.indexOf(name) !== -1) {
            alias[`${name}$`] = aliasPath;
        } else {
            alias[name] = aliasPath;
        }
    });
});

module.exports = {
    ...webpackConfig,
    output: {
        ...webpackConfig.output,
        libraryTarget: 'umd',
        library: 'panneau',
        libraryExport: 'default',
    },
    resolve: {
        ...webpackConfig.resolve,
        alias,
        modules,
    },
    externals: [],
};
