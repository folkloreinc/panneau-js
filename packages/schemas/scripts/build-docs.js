const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const colors = require('colors');

const destDir = path.join(__dirname, '../docs');
const srcDir = path.join(__dirname, '../src');

console.log(colors.yellow(`Ensure the ${destDir} is present...`));
fs.ensureDirSync(destDir);

console.log(colors.yellow(`Copying definition files...`));
const files = glob.sync(path.join(srcDir, 'schemas/*.json'));
files.forEach(file => {
    const filePath = path.basename(file);
    const destPath = path.join(destDir, filePath);
    if (fs.pathExistsSync(destPath)) {
        fs.removeSync(destPath);
    }
    fs.copySync(file, destPath);
});

console.log(colors.green('Done.'));
