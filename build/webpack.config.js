const path = require('path');

module.exports = (env) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const createConfig = require(path.join(__dirname, `./webpack.config.${env || 'dist'}`));
    return createConfig(env);
};
