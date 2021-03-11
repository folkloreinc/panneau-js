const path = require('path');
const fs = require('fs');
const { sync: globSync } = require('glob');
const getPackagesPaths = require('./getPackagesPaths');

const getPackagesAliases = ({ withoutEndSign = false } = {}) =>
    getPackagesPaths().reduce((aliases, packagePath) => {
        const { name: packageName } = require(path.join(packagePath, './package.json'));
        const subFiles = globSync(path.join(packagePath, './*.js'));
        const hasStylesFile = fs.existsSync(path.join(packagePath, './src/styles.scss'));
        const hasStylesTemplate = fs.existsSync(path.join(packagePath, './src/styles.scss.ejs'));
        return {
            ...aliases,
            ...subFiles
                .filter((filePath) => path.basename(filePath, '.js').match(/^[^\.\/]+$/) !== null)
                .reduce((subAliases, filePath) => {
                    const fileName = path.basename(filePath, '.js');
                    return {
                        ...subAliases,
                        [`${packageName}/${fileName}${!withoutEndSign ? '$' : ''}`]: path.join(
                            packagePath,
                            `./src/${fileName}.js`,
                        ),
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
