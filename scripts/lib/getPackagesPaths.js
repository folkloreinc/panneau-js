const path = require('path');
const globSync = require('glob').sync;
const lerna = require('../../lerna.json');

const rootDir = path.join(__dirname, '../../');

const getPackagesPaths = () =>
    lerna.packages
        .map(it => it.replace(/\/\*/, '/'))
        .reduce(
            (paths, packagesPath) => [
                ...paths,
                ...globSync(path.join(rootDir, packagesPath, './*')),
            ],
            [],
        );

module.exports = getPackagesPaths;
