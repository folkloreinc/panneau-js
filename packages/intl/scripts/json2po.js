#!/usr/bin/env node
const { program } = require('commander');
const fsExtra = require('fs-extra');

const POFile = require('./lib/POFile');

let srcPath;
let destPath;
program
    .arguments('<src> <dest>')
    .option('-d, --default', 'Is default language')
    .action((src, dest) => {
        srcPath = src;
        destPath = dest;
    });

program.parse(process.argv);

const messages = fsExtra.readJsonSync(srcPath);

const poFile = new POFile(destPath, {
    useDefaultMessage: program.default || false,
});
poFile.update(messages);
poFile.save();
