const path = require('path');
const webpackConfig = require(path.join(__dirname, '../.storybook/webpack.config'));
module.exports = (storybookBaseConfig, configType) => {
    const config = webpackConfig(storybookBaseConfig, configType);

    config.module.rules.push({
        test: require.resolve('./getStories.js'),
        use: [{
            loader: 'val-loader'
        }]
    });

    return config;
};
