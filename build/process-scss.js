const path = require('path');
const sass = require('node-sass');
const tildeImporter = require('node-sass-tilde-importer');
const getResolveModules = require('./lib/getResolveModules');

module.exports = (data, filename) => {
    const result = sass.renderSync({
        data,
        file: filename,
        importer: tildeImporter,
        includePaths: [
            path.join(process.env.PWD, './node_modules'),
            path.join(__dirname, '../node_modules'),
            ...getResolveModules(),
        ],
    }).css;
    return result.toString('utf8');
};
