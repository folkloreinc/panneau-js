require('dotenv').config();

const proxyMiddleware = require('./api/proxy');
const apiMiddleware = require('./api/middleware');

module.exports = (router) => {
    const proxyUrl = process.env.API_PROXY_URL || null;

    if (proxyUrl !== null) {
        console.log('Using API proxy: ', proxyUrl);
        router.use('/api', proxyMiddleware(proxyUrl));
    } else {
        console.log('Using API middleware');
        router.use('/api', apiMiddleware(router));
    }

    return router;
};
