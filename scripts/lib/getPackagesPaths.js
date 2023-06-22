const path = require('path');
const globSync = require('glob').sync;
const lerna = require('../../package.json');

const rootDir = path.join(__dirname, '../../');

const getPackagesPaths = () =>
    lerna.workspaces
        .map((it) => it.replace(/\/\*/, '/'))
        .reduce(
            (paths, packagesPath) => [
                ...paths,
                ...globSync(path.join(rootDir, packagesPath, './*')),
            ],
            [],
        );

module.exports = getPackagesPaths;
