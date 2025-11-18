require('dotenv').config();

const proxyMiddleware = require('./api/proxy');
const apiMiddleware = require('./api/middleware');

module.exports = (router) => {
    const proxyUrl = process.env.API_PROXY_URL || null;
    console.log('router', router);
    console.log('Using API proxy:', proxyUrl);

    if (proxyUrl !== null) {
        router.use('/api', proxyMiddleware(proxyUrl));
    } else {
        router.use('/api', apiMiddleware());
    }
};
