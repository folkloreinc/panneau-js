/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const glob = require('glob');
const fs = require('fs');
const webpackMerge = require('webpack-merge');
const webpackConfig = require('../../build/webpack.config.panneau');
/* eslint-enable import/no-extraneous-dependencies */

const modules = [
    path.join(process.env.PWD, './node_modules'),
    path.join(__dirname, '../../node_modules'),
    path.join(__dirname, '../../fields/fields/node_modules'),
    path.join(__dirname, '../../layouts/layouts/node_modules'),
    path.join(__dirname, '../../lists/lists/node_modules'),
    path.join(__dirname, '../../forms/forms/node_modules'),
    path.join(__dirname, '../../modals/modals/node_modules'),
];
const alias = {};
const exactPackages = [
    'lodash',
    'babel-runtime',
];
const lernaConfig = require('../../lerna.json');
lernaConfig.packages.forEach((packagesPath) => {
    const packages = glob.sync(path.join(__dirname, '../../', packagesPath));
    packages.forEach((packagePath) => {
        modules.push(path.resolve(packagePath, './node_modules'));
        const packageJSON = require(path.resolve(packagePath, './package.json'));
        alias[packageJSON.name] = path.resolve(packagePath, './src/index');
        const dependencies = []
            .concat(Object.keys(packageJSON.dependencies || {}))
            .concat(Object.keys(packageJSON.devDependencies || {}));
        dependencies.forEach((name) => {
            const aliasPath = path.resolve(__dirname, `../node_modules/${name}`);
            if (name.match(/^\@panneau/) || !fs.existsSync(aliasPath)) {
                return;
            }
            if (exactPackages.indexOf(name) !== -1) {
                alias[`${name}$`] = aliasPath;
            } else {
                alias[name] = aliasPath;
            }
        });
    });
});

module.exports = env => (
    webpackMerge(webpackConfig(env), {
        entry: {
            panneau: './index',
        },

        resolve: {
            alias,
            modules,
        },
    })
);
