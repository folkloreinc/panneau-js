const path = require('path');
const getPackagesPaths = require('./getPackagesPaths');

const getResolveAliases = () => getPackagesPaths().reduce(
    (aliases, packagePath) => {
        const packageJSON = require(path.resolve(packagePath, './package.json'));
        return {
            ...aliases,
            [`${packageJSON.name}$`]: path.resolve(packagePath, './src/index'),
            [`${packageJSON.name}`]: path.resolve(packagePath, './src'),
            // [new RegExp(`^${packageJSON.name}/`)]: path.resolve(packagePath, './'),
        };
    },
    {
        jquery: require.resolve('jquery-slim'),
    },
);

module.exports = getResolveAliases;
