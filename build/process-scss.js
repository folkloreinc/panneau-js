// eslint-disable-next-line import/no-extraneous-dependencies
const sass = require('node-sass');
const path = require('path');

module.exports = (data, filename) => {
    const result = sass.renderSync({
        data,
        file: filename,
        includePaths: [
            path.join(process.env.PWD, './node_modules'),
            path.join(__dirname, '../node_modules'),
        ],
    }).css;
    return result.toString('utf8');
};
