#!/usr/bin/env node

const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
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

const nodeModulesPath = path.join(process.cwd(), './node_modules/');
const packageJsonPath = path.join(process.cwd(), 'package.json');
const { dependencies } = fsExtra.readJsonSync(packageJsonPath);

const patternRegExp = new RegExp(`^${pattern.replace('*', '.*')}$`, 'i');
const packages = Object.keys(dependencies).filter(
    (it) =>
        patternRegExp.test(it) &&
        fs.existsSync(
            path.resolve(nodeModulesPath, `${it}/assets/css/styles.css`),
        ),
);

const templateStr = fs.readFileSync(templateFile);
const styles = ejs.render(templateStr.toString('utf-8'), {
    packages,
});

fsExtra.outputFileSync(outFile, styles);
