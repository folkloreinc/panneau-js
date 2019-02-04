const path = require('path');
const webpackConfig = require(path.join(__dirname, '../.storybook/webpack.config'));
module.exports = (storybookBaseConfig, configType) => {
    const config = webpackConfig(storybookBaseConfig, configType);

    const babelLoader = {
        loader: 'babel-loader',
        options: {
            presets: [
                path.resolve(path.join(__dirname, '../build/babel-preset')),
            ],
            cacheDirectory: true,
            // Save disk space when time isn't as important
            cacheCompression: true,
            compact: true,
        },
    };

    config.module.rules.push({
        test: require.resolve('./getStories.js'),
        use: [babelLoader, {
            loader: 'val-loader'
        }]
    });

    return config;
};
