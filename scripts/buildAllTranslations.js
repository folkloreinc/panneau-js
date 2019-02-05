const path = require('path');
const fs = require('fs');
/* eslint-disable import/no-extraneous-dependencies */
const mkdirp = require('mkdirp');
/* eslint-enable import/no-extraneous-dependencies */
const getPackagesPaths = require('../build/lib/getPackagesPaths');
const getTranslations = require('../build/lib/getTranslations');
const sortTranslations = require('../build/lib/sortTranslations');

const langFile = path.join(process.env.PWD, './intl/lang/en.json');

const messages = getPackagesPaths().reduce((allMessages, packagePath) => {
    const messagesPattern = path.join(packagePath, './intl/messages/**/*.json');
    return {
        ...allMessages,
        ...getTranslations(messagesPattern),
    };
}, {});

const sortedMessages = sortTranslations(messages);

mkdirp.sync(path.dirname(langFile));
fs.writeFileSync(langFile, JSON.stringify(sortedMessages, null, 4));
