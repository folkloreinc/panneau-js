const path = require('path');
const fs = require('fs');
const { sync: globSync } = require('glob');
const getPackagesPaths = require('./getPackagesPaths');

const getPackagesAliases = ({ withoutEndSign = false } = {}) =>
    getPackagesPaths().reduce((aliases, packagePath) => {
        const { name: packageName, exports = null } = require(
            path.join(packagePath, './package.json'),
        );
        const subFiles = globSync(path.join(packagePath, './*.js'));
        const hasStylesFile = fs.existsSync(path.join(packagePath, './src/styles.scss'));
        const hasStylesTemplate = fs.existsSync(path.join(packagePath, './src/styles.scss.ejs'));
        return {
            ...aliases,
            ...subFiles
                .filter((filePath) => path.basename(filePath, '.js').match(/^[^\.\/]+$/) !== null)
                .reduce((subAliases, filePath) => {
                    const fileName = path.basename(filePath, '.js');
                    const sourcePath = path.join(packagePath, `./src/${fileName}`);
                    return {
                        ...subAliases,
                        [`${packageName}/${fileName}${!withoutEndSign ? '$' : ''}`]: fs.existsSync(
                            `${sourcePath}.ts`,
                        )
                            ? `${sourcePath}.ts`
                            : `${sourcePath}.js`,
                    };
                }, {}),
            ...Object.keys(exports || {}).reduce((subAliases, exportName) => {
                if (exportName === '.' || exportName === './index') {
                    return subAliases;
                }
                const sourcePath = fs.existsSync(path.join(packagePath, exportName))
                    ? path.join(packagePath, exportName)
                    : path.join(packagePath, './src', `${exportName}.js`);
                return {
                    ...subAliases,
                    [`${packageName}/${exportName.replace(/^\.\//, '')}${!withoutEndSign ? '$' : ''}`]:
                        fs.existsSync(sourcePath.replace(/\.js$/, '.ts'))
                            ? sourcePath.replace(/\.js$/, '.ts')
                            : sourcePath,
                    [`${packageName}/${exportName.replace(/^\.\//, '').replace(/\.([^\.]{2,6})$/, '')}${!withoutEndSign ? '$' : ''}`]:
                        fs.existsSync(sourcePath.replace(/\.js$/, '.ts'))
                            ? sourcePath.replace(/\.js$/, '.ts')
                            : sourcePath,
                };
            }, {}),
            ...(!hasStylesTemplate
                ? {
                      [`${packageName}/scss`]: path.join(
                          packagePath,
                          hasStylesFile ? './src' : './src/styles',
                      ),
                  }
                : null),
            [`${packageName}${!withoutEndSign ? '$' : ''}`]: path.join(
                packagePath,
                './src/index.js',
            ),
        };
    }, {});

module.exports = getPackagesAliases;
