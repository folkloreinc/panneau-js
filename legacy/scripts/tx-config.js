#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const chalk = require('chalk');
const getPackagesPaths = require('./lib/getPackagesPaths');

const config = fs.readFileSync(path.join(__dirname, './stubs/tx-config')).toString('utf-8');

getPackagesPaths()
    .filter((packagePath) => packagePath.match(/packages\/intl/) === null)
    .forEach((packagePath) => {
        const { name, lang = null } = fsExtra.readJsonSync(path.join(packagePath, 'package.json'));
        if (lang !== null) {
            const [project, resource] = name.split('/');
            const newConfig = config
                .replace(/%project/, project.replace(/^@/, ''))
                .replace(/%resource/, resource);
            const configPath = path.join(packagePath, '.tx/config');
            fsExtra.outputFile(configPath, newConfig);
            console.log(`${chalk.green('Created')} - ${name} - config file ${configPath}`);
        } else {
            console.log(`${chalk.yellow('Not found')} - ${name} - "lang" config in package.json`);
        }
    });
