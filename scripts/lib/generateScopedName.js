const pkgUp = require('pkg-up');
const path = require('path');
const fs = require('fs');
const slugify = require('slugify');



const generateScopedName = (localName, filePath) => {
    if (!filePath.match(/\.module\.scss$/)) {
        return localName;
    }
    const packageJsonPath = pkgUp.sync({
        cwd: path.dirname(filePath),
    });
    const packagePath = path.dirname(packageJsonPath);
    const { name: packageName } = require(packageJsonPath);
    const stylesPath = path.join(packagePath, 'src/styles');
    const hasStylesPath = fs.existsSync(stylesPath);
    const namespace = slugify(packageName.replace(/[@/]/gi, ' '));

    const relativePath = hasStylesPath ? path.relative(stylesPath, filePath) : null;
    const subDirectory = relativePath !== null ? path.dirname(relativePath).replace(/\//gi, '-').replace(/[^a-z-]+/gi, '') : null;
    const basename = path.basename(filePath).replace(/(\.module|\.global)?\.s?css$/i, '');
    const finalNamespace = subDirectory !== null && subDirectory.length > 0 ? `${namespace}-${subDirectory}` : namespace;
    const basenamePattern = new RegExp(`-${basename}$`, 'gi');
    const name = basename !== 'styles' && !basenamePattern.test(finalNamespace) ? `${finalNamespace}-${basename}` : finalNamespace;
    return '[name]-[local]'
        .replace(/\[\s*name\s*\]/gi, name)
        .replace(/\[\s*local\s*\]/gi, localName);
};

module.exports = generateScopedName;
