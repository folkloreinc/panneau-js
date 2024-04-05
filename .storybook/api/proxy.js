const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (proxy) =>
    createProxyMiddleware({
        target: proxy,
        changeOrigin: true,
        followRedirects: true,
        secure: false,
    });
