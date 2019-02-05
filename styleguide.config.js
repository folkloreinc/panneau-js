const path = require('path');

module.exports = {
    webpackConfig: require('./build/webpack.config.styleguide'),
    styleguideComponents: {
        Wrapper: path.join(__dirname, './build/styleguide/Wrapper'),
    },
    sections: [
        {
            name: 'Fields',
            components: 'fields/*/src/[A-Z]*.jsx',
            usageMode: 'expand',
            ignore: [
                'fields/items/src/Sortable*.jsx',
            ],
        },
        {
            name: 'Forms',
            components: 'forms/*/src/[A-Z]*.jsx',
        },
        {
            name: 'Layouts',
            components: 'layouts/*/src/[A-Z]*.jsx',
        },
        {
            name: 'Lists',
            components: 'lists/*/src/[A-Z]*.jsx',
        },
        {
            name: 'Modals',
            components: 'modals/*/src/[A-Z]*.jsx',
        },
        {
            name: 'Previews',
            components: 'previews/*/src/[A-Z]*.jsx',
        },
        {
            name: 'Panneau',
            components: 'packages/*/src/[A-Z]*.jsx',
        },
    ],
};
