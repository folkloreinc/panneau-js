const path = require('path');

const ROOT_PATH = path.join(__dirname, '../');

module.exports = (localName, filePath) => {
    const localIdentName = 'panneau-[name]-[local]';
    const relativePath = filePath.replace(ROOT_PATH, '');
    const nameMatches = relativePath.match(/^([^/]+)\/([^/]+)/);
    const basename = path.basename(filePath, '.scss');
    const fileSuffix = basename !== 'styles' ? `-${basename}` : '';
    const identName = localIdentName.replace(/\[\s*name\s*\]/gi, `${nameMatches[1]}-${nameMatches[2]}${fileSuffix}`)
        .replace(/\[\s*local\s*\]/gi, localName);
    return identName;
};
