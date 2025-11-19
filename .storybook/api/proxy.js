const { createProxyMiddleware } = require('http-proxy-middleware');

// TODO: test this with polka (https://github.com/lukeed/polka) the new storybook server
module.exports = (proxy) =>
    createProxyMiddleware({
        target: proxy,
        changeOrigin: true,
        followRedirects: true,
        secure: false,
    });
