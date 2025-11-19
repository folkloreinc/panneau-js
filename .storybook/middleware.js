require('dotenv').config();

const proxyMiddleware = require('./api/proxy');
const apiMiddleware = require('./api/middleware');
const path = require('path');
const sirv = require('sirv');

module.exports = (router) => {
    const proxyUrl = process.env.API_PROXY_URL || null;
    // console.log('Using API proxy:', proxyUrl);
    if (proxyUrl !== null) {
        router.use('/api', proxyMiddleware(proxyUrl));
    } else {
        // const dataPath = path.join(__dirname, '/api/items');
        // const staticServe = sirv(dataPath, {
        //     dev: true,
        //     single: false,
        // });
        // router.use(
        //     '/items',
        //     staticServe,
        //     // express.static(dataPath, {
        //     //     index: false,
        //     //     extensions: ['json'],
        //     // }),
        // );
        // router.use('/api', apiMiddleware(router));
    }

    return router;
};
