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
                        plugins: [
                            {
                                name: 'preset-default',
                                overrides: {
                                    name: 'removeViewBox',
                                    active: false,
                                },
                            },
                        ],
                    },
                },
            ],
        }),
    ],
};
