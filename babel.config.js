const path = require('path');
const lernaJSON = require('./lerna.json');

module.exports = {
    babelrcRoots: [
        '.',
        ...lernaJSON.packages.map(packagePath => path.join('./', packagePath)),
    ],
    presets: [
        path.resolve(__dirname, './build/babel-preset'),
    ],
};
