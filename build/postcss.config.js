/* eslint-disable no-console, global-require */
/* eslint-disable import/no-extraneous-dependencies, import/no-dynamic-require, import/order */

module.exports = () => ({
    ident: 'postcss',
    plugins: [
        require('postcss-flexbugs-fixes'),
        require('postcss-preset-env')({
            autoprefixer: {
                flexbox: 'no-2009',
            },
            stage: 3,
        }),
    ],
});
