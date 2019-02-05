const path = require('path');
const glob = require('glob');

module.exports = () => {
    const lernaConfig = require('../../lerna.json');
    return lernaConfig.packages.reduce((items, packagesPath) => (
        [].concat(items).concat(glob.sync(path.join(__dirname, '../../', packagesPath)))
    ), []);
};
