#!/usr/bin/env node
const path = require('path');
const { program } = require('commander');
const { sync: globSync } = require('glob');
const { compileAndWrite } = require('@formatjs/cli-lib');
const { idInterpolationPattern } = require('./config.cjs');

let srcPath;
let destPath;
program
    .arguments('<src> <dest>')
    .option('-a, --ast', 'With ast')
    .action((src, dest) => {
        srcPath = src;
        destPath = dest;
    });

program.parse(process.argv);

globSync(srcPath, {
    nodir: true,
    cwd: process.cwd(),
}).forEach((file) => {
    const options = program.opts();
    compileAndWrite([path.join(process.cwd(), file)], {
        ast: options.ast,
        throws: true,
        // format: 'crowdin',
        idInterpolationPattern,
        outFile: path.join(process.cwd(), destPath, path.basename(file)),
    });
});
