const path = require('path');

const ROOT_PATH = path.join(__dirname, '../');

const getLocalIdent = (context, localIdentName, localeName) => {
    const filePath = context.resourcePath;
    const relativePath = filePath.replace(ROOT_PATH, '');
    const nameMatches = relativePath.match(/^([^/]+)\/([^/]+)/);
    const basename = path.basename(filePath, '.scss');
    const fileSuffix = basename !== 'styles' ? `-${basename}` : '';
    return localIdentName.replace(/\[\s*name\s*\]/gi, `${nameMatches[1]}-${nameMatches[2]}${fileSuffix}`)
        .replace(/\[\s*local\s*\]/gi, localeName);
};

module.exports = {
    getLocalIdent,
};
