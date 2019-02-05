const path = require('path');

const LOCAL_IDENT_NAME = 'panneau-[name]-[local]';
const ROOT_PATH = path.join(__dirname, '../../');

module.exports = (localName, filePath) => {
    const relativePath = filePath.replace(ROOT_PATH, '');
    const nameMatches = relativePath.match(/^([^/]+)\/([^/]+)/);
    const packageJson = require(path.join(ROOT_PATH, nameMatches[1], nameMatches[2], 'package.json'));
    const packageName = packageJson.name.replace(/^(@panneau|panneau)\/?/, '');
    const basename = path.basename(filePath, '.scss');
    const fileSuffix = basename !== 'styles' ? `-${basename}` : '';
    const identName = LOCAL_IDENT_NAME.replace(/\[\s*name\s*\]/gi, `${packageName}${fileSuffix}`)
        .replace(/\[\s*local\s*\]/gi, localName);
    return identName;
};
