module.exports = ({ options }) => ({
    map: {
        inline: false,
    },
    plugins: {
        autoprefixer: options.env !== 'dev' ? {} : false,
        cssnano: options.env !== 'dev' ? {
            preset: 'default',
            zindex: false,
        } : false,
    },
});
