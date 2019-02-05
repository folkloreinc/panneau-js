const path = require('path');
const uniq = require('lodash/uniq');
const getPackagesPaths = require('./getPackagesPaths');

const getExternalsWhitelist = () => (
    getPackagesPaths().filter(it => !it.match(/generator/)).reduce((externals, packagePath) => {
        const packageJSON = require(path.resolve(packagePath, './package.json'));
        return uniq([
            ...externals,
            ...Object.keys(packageJSON.dependencies || {})
                .filter(it => !it.match(/^@panneau/)),
        ]);
    }, []).map(it => new RegExp(`^${it}(/.*)?$`))
);

module.exports = getExternalsWhitelist;
