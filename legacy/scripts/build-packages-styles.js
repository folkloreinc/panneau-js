#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const fsExtra = require('fs-extra');
const { program } = require('commander');

let templateFile = null;
let outFile = null;

program
    .arguments('<template> <out>')
    .option('-p, --pattern <pattern>', 'The packages pattern', '@panneau/*')
    .action((template, out) => {
        templateFile = path.join(process.cwd(), template);
        outFile = path.join(process.cwd(), out);
    });

program.parse(process.argv);

const { pattern } = program.opts();

const packageJsonPath = path.join(process.cwd(), 'package.json');
const { dependencies } = fsExtra.readJsonSync(packageJsonPath);

// console.log('dependencies', Object.keys(dependencies));

const patternRegExp = new RegExp(`^${pattern.replace('*', '.*')}$`, 'i');
const packages = Object.keys(dependencies).filter((it) => {
    if (!patternRegExp.test(it)) {
        return false;
    }
    try {
        require.resolve(`${it}/assets/css/styles.css`);
    } catch (e) {
        // console.log(e);
        return false;
    }
    return true;
});

const templateStr = fs.readFileSync(templateFile);
const styles = ejs.render(templateStr.toString('utf-8'), {
    packages,
});

fsExtra.outputFileSync(outFile, styles);
