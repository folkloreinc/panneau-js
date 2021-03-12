#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const glob = require('glob');
const getPackagesPaths = require('./lib/getPackagesPaths');
const sortIntlMessages = require('./lib/sortIntlMessages');

const globalPath = path.join(__dirname, '../packages/intl');

const langFiles = getPackagesPaths()
    .filter((packagePath) => packagePath !== globalPath)
    .reduce(
        (allFiles, packagePath) => [
            ...allFiles,
            ...glob.sync(path.join(packagePath, './lang/*.json')),
        ],
        [],
    );

const messagesByLocale = langFiles.reduce((map, langFile) => {
    const locale = path.basename(langFile, '.json');
    const messages = require(langFile);
    return {
        ...map,
        [locale]: {
            ...(map[locale] || null),
            ...messages,
        },
    };
}, {});

Object.keys(messagesByLocale).forEach((locale) => {
    const langFile = path.join(globalPath, `./lang/${locale}.json`);
    const sortedMessages = sortIntlMessages(messagesByLocale[locale]);
    mkdirp.sync(path.dirname(langFile));
    fs.writeFileSync(langFile, JSON.stringify(sortedMessages, null, 4));
});
