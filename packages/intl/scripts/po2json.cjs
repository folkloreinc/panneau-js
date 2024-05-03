#!/usr/bin/env node
const { program } = require('commander');
const fsExtra = require('fs-extra');

const POFile = require('./lib/POFile.cjs');

let srcPath;
let destPath;
program.arguments('<src> <dest>').action((src, dest) => {
    srcPath = src;
    destPath = dest;
});

program.parse(process.argv);

const poFile = new POFile(srcPath);
fsExtra.outputJsonSync(destPath, poFile.toJSON(), {
    spaces: 4,
});
