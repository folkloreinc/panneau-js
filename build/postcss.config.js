const config = require('./config');

module.exports = ({ options }) =>
Object.assign(
    {},
    config.postcss,
    (
        typeof options.env !== 'undefined' &&
        typeof config.postcss.env !== 'undefined' &&
        typeof config.postcss.env[options.env] !== 'undefined'
    ) ? config.postcss.env[options.env] : null,
);
