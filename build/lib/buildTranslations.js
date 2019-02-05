const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const getTranslations = require('./getTranslations');

module.exports = (messagesPattern, langFile) => {
    const messages = getTranslations(messagesPattern);
    mkdirp.sync(path.dirname(langFile));
    fs.writeFileSync(langFile, JSON.stringify(messages, null, 4));
};
