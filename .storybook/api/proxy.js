const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (proxy) => {
    return createProxyMiddleware({
        target: proxy,
        changeOrigin: true,
    });
};
