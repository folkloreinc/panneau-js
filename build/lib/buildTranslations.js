const path = require('path');
const fs = require('fs');
/* eslint-disable import/no-extraneous-dependencies */
const mkdirp = require('mkdirp');
/* eslint-enable import/no-extraneous-dependencies */
const getTranslations = require('./getTranslations');

module.exports = (messagesPattern, langFile) => {
    const messages = getTranslations(messagesPattern);
    mkdirp.sync(path.dirname(langFile));
    fs.writeFileSync(langFile, JSON.stringify(messages, null, 4));
};
