const { extendDefaultPlugins } = require('svgo');

module.exports = {
    plugins: [
        require('postcss-flexbugs-fixes'),
        require('postcss-preset-env')({
            autoprefixer: {
                flexbox: 'no-2009',
            },
            stage: 3,
        }),
        require('cssnano')({
            preset: [
                'default',
                {
                    svgo: {
                        plugins: extendDefaultPlugins([
                            {
                                name: 'removeViewBox',
                                active: false,
                            },
                        ]),
                    },
                },
            ],
        }),
    ],
};
