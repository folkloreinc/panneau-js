// eslint-disable-next-line import/no-extraneous-dependencies
const sass = require('node-sass');

module.exports = (data, filename) => {
    const result = sass.renderSync({
        data,
        file: filename,
    }).css;
    return result.toString('utf8');
};
