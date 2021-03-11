const path = require('path');
const getPackagesPaths = require('./getPackagesPaths');

const getResolveModules = () => [
    path.resolve(process.env.PWD, './node_modules'),
    path.resolve(__dirname, '../../node_modules'),
    ...getPackagesPaths().filter(it => !it.match(/^generator/)).map(it => path.resolve(it, './node_modules')),
];

module.exports = getResolveModules;
