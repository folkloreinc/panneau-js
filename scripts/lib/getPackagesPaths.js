const path = require('path');
const fs = require('fs');
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
        )
        .filter((packagePath) => fs.existsSync(path.join(packagePath, './package.json')));

module.exports = getPackagesPaths;
