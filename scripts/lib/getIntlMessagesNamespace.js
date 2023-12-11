const path = require('path');

const getIntlMessagesNamespace = (id) => {
    const packageJson = require(path.join(process.cwd(), './package.json'));
    const { name = null } = packageJson || {};
    const namespace =
        name !== null
            ? name
                  .replace(
                      /^@panneau\/(form|element|field|filter|list|index|modal|display)-(.*)$/,
                      '$1s.$2',
                  )
                  .replace(/^@panneau\/(.*)$/, '$1')
            : null;
    return name !== null ? `${namespace}.${id}` : id;
};

module.exports = getIntlMessagesNamespace;
