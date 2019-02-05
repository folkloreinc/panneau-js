const path = require('path');
const {
    jsLoader,
    jsDependenciesLoader,
    styleCssLoader,
    styleGlobalSassLoader,
    styleSassLoader,
    fontsLoader,
    imagesLoader,
    mediasLoader,
} = require('./lib/loaders');

module.exports = {
    module: {
        rules: [
            {
                oneOf: [
                    fontsLoader,
                    imagesLoader,
                    {
                        ...jsLoader,
                        include: [
                            ...jsLoader.include,
                            path.join(__dirname, './styleguide'),
                        ],
                    },
                    jsDependenciesLoader,
                    styleCssLoader,
                    styleGlobalSassLoader,
                    styleSassLoader,
                    mediasLoader,
                ],
            },
        ],
    },
};
