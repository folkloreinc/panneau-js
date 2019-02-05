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
                    jsLoader,
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
