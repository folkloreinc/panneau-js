/* eslint-disable global-require */

module.exports = {
    sections: [
        {
            name: 'Fields',
            components: 'fields/*/src/[A-Z]*.jsx',
        },
        {
            name: 'Lists',
            components: 'lists/*/src/[A-Z]*.jsx',
        },
    ],
    webpackConfig: require('./build/webpack.config.styleguide'),
};
