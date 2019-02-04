const path = require('path');
const fs = require('fs');
const getPackagesPaths = require('./getPackagesPaths');

const defaultExactPackages = ['lodash', 'babel-runtime'];

const getResolveAliases = (exactPackages = defaultExactPackages) => (
    getPackagesPaths().reduce((aliases, packagePath) => {
        const packageJSON = require(path.resolve(packagePath, './package.json')); // eslint-disable-line
        const dependencies = []
            .concat(Object.keys(packageJSON.dependencies || {}))
            .concat(Object.keys(packageJSON.devDependencies || {}));
        return dependencies.reduce(
            (depsAliases, name) => {
                const aliasPath = path.resolve(packagePath, `./node_modules/${name}`);
                if (name.match(/^@panneau/) || !fs.existsSync(aliasPath)) {
                    return depsAliases;
                }
                return {
                    ...depsAliases,
                    [exactPackages.indexOf(name) !== -1 ? `${name}$` : name]: aliasPath,
                };
            },
            {
                ...aliases,
                [packageJSON.name]: path.resolve(packagePath, './src/index'),
            },
        );
    }, {
        jquery: require.resolve('jquery-slim'),
    })
);

module.exports = getResolveAliases;
