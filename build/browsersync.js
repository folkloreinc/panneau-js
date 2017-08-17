/* eslint-disable import/no-extraneous-dependencies */
const BrowserSync = require('browser-sync');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const proxyMiddleware = require('proxy-middleware');
const servestaticMiddleware = require('serve-static');
const stripAnsi = require('strip-ansi');
const url = require('url');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
/* eslint-enable import/no-extraneous-dependencies */

const config = require('./config');
const createWebpackConfig = require('./webpack.config');

const webpackConfig = createWebpackConfig('dev');
const browserSyncConfig = _.get(config, 'browsersync', {});
const webpackMiddlewareConfig = _.get(config, 'webpackMiddleware', {});

const browserSync = BrowserSync.create();
const bundler = webpack(webpackConfig);

/**
 * Reload all devices when bundle is complete
 * or send a fullscreen error message to the browser instead
 */
bundler.plugin('done', (stats) => {
    if (stats.hasErrors() || stats.hasWarnings()) {
        return browserSync.sockets.emit('fullscreen:message', {
            title: 'Webpack Error:',
            body: stripAnsi(stats.toString()),
            timeout: 100000,
        });
    }
    return null;
    
});

/**
 * Browser sync options
 */
const browserSyncOptions = _.merge({
    logFileChanges: false,

    middleware: [],

    plugins: [
        'bs-fullscreen-message',
    ],
}, browserSyncConfig);

/**
 * Webpack middleware options
 */
const webpackMiddlewareOptions = _.merge({
    publicPath: webpackConfig.output.publicPath,
}, webpackMiddlewareConfig);

/**
 * Webpack middleware
 */
const webpackMiddleware = webpackDevMiddleware(bundler, webpackMiddlewareOptions);
browserSyncOptions.middleware.push(webpackMiddleware);
browserSyncOptions.middleware.push(webpackHotMiddleware(bundler));


/**
 * Proxy
 */
if (browserSyncOptions.proxy) {
    const proxyHost = url.parse(browserSyncOptions.proxy);
    browserSyncOptions.proxy = null;
    browserSyncOptions.open = 'external';
    delete browserSyncOptions.proxy;

    /**
     * Static middleware
     */
    const baseDirs = _.get(browserSyncOptions, 'server.baseDir', []);
    const serveStaticMiddlewares = {};
    for (let i = 0, bl = baseDirs.length; i < bl; i += 1) {
        serveStaticMiddlewares[baseDirs[i]] = servestaticMiddleware(baseDirs[i]);
    }
    const staticMiddleware = (req, res, next) => {
        const requestUrl = url.parse(req.url);
        const urlPath = requestUrl.pathname;

        const staticMiddlewareKey = Object.keys(serveStaticMiddlewares).find((key) => {
            try {
                const stats = fs.lstatSync(path.join(key, urlPath));
                return stats.isFile();
            } catch (e) {
                // console.error(e);
            }
            return false;
        });

        if (staticMiddlewareKey) {
            return serveStaticMiddlewares[staticMiddlewareKey](req, res, next);
        }

        return next();
    };
    browserSyncOptions.middleware.push(staticMiddleware);

    /**
     * Proxy middleware
     */
    const proxyMiddlewareOptions = url.parse(`http://${proxyHost.host}`);
    proxyMiddlewareOptions.preserveHost = true;
    proxyMiddlewareOptions.via = 'browserSync';
    browserSyncOptions.middleware.push(proxyMiddleware(proxyMiddlewareOptions));
}

/**
 * Start webpack
 */
browserSync.init(browserSyncOptions);
