module.exports = {

    /**
     * Browsersync
     */
    browsersync: {
        server: {
            baseDir: [
    './.tmp',
    './examples'
],
            index: 'index.html',
        },
        files: [
    'examples/**'
],
        ghostMode: false,
    },

    /**
     * Webpack middleware
     */
    webpackMiddleware: {
        noInfo: false,

        quiet: false,

        lazy: false,

        watchOptions: {
            aggregateTimeout: 300,
            poll: false,
            ignored: /node_modules/,
        },

        stats: {
            colors: true,
        },
    },

    imagemin: {
        files: [
            'src/img/**/*.{jpg,png,jpeg,gif,svg}',
        ],
        output: 'dist/img',
    },

    /**
     * PostCSS
     */
    postcss: {
        map: {
            inline: false,
        },
        plugins: {
            autoprefixer: {},
            cssnano: {
                preset: 'default',
                zindex: false,
            },
        },
        env: {
            dev: {
                plugins: {
                    autoprefixer: false,
                    cssnano: false,
                },
            },
        },
    },

    /**
     * Modernizr
     */
    modernizr: {
        cache: true,

        devFile: false,

        dest: '.tmp/modernizr.js',

        options: [
            'setClasses',
            'addTest',
            'html5printshiv',
            'testProp',
            'fnBind',
        ],

        uglify: false,

        tests: [],

        excludeTests: ['hidden'],

        crawl: true,

        useBuffers: false,

        files: {
            src: [
                '*[^(g|G)runt(file)?].{js,css,scss}',
                '**[^node_modules]/**/*.{js,css,scss}',
                '!lib/**/*',
            ],
        },

        customTests: [],
    },

};
