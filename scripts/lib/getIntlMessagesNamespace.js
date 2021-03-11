const path = require('path');

const getIntlMessagesNamespace = id => {
    const packageJson = require(path.join(process.cwd(), './package.json'));
    const { name = null } = packageJson || {};
    const namespace =
        name !== null
            ? name
                  .replace(/^@micromag\/(screen|element|field)-(.*)$/, '$1s.$2')
                  .replace(/^@micromag\/(.*)$/, '$1')
            : null;
    return name !== null ? `${namespace}.${id}` : id;
};


module.exports = getIntlMessagesNamespace;
