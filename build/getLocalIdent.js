const getLocalIdent = require('./lib/getLocalIdent');

module.exports = (context, localIdentName, localName) => (
    getLocalIdent(localName, context.resourcePath)
);
