const path = require('path');
/* eslint-disable import/no-extraneous-dependencies */
const sass = require('node-sass');
const tildeImporter = require('node-sass-tilde-importer');
/* eslint-disable import/no-extraneous-dependencies */

module.exports = (data, filename) => {
    const result = sass.renderSync({
        data,
        file: filename,
        importer: tildeImporter,
        includePaths: [
            path.join(process.env.PWD, './node_modules'),
            path.join(__dirname, '../node_modules'),
            path.join(__dirname, '../fields/select/node_modules'),
            path.join(__dirname, '../fields/fields/node_modules'),
            path.join(__dirname, '../layouts/layouts/node_modules'),
            path.join(__dirname, '../lists/lists/node_modules'),
            path.join(__dirname, '../modals/modals/node_modules'),
        ],
    }).css;
    return result.toString('utf8');
};
