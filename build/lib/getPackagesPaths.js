const path = require('path');
/* eslint-disable import/no-extraneous-dependencies */
const glob = require('glob');
/* eslint-enable import/no-extraneous-dependencies */

module.exports = () => {
    const lernaConfig = require('../../lerna.json'); // eslint-disable-line
    return lernaConfig.packages.reduce((items, packagesPath) => (
        [].concat(items).concat(glob.sync(path.join(__dirname, '../../', packagesPath)))
    ), []);
};
