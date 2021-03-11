const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const getIntlMessages = require('./getIntlMessages');

const buildIntlMessages = (messagesPattern, langFile) => {
    const messages = getIntlMessages(messagesPattern);
    if (messages !== null && Object.keys(messages).length > 0) {
        mkdirp.sync(path.dirname(langFile));
        fs.writeFileSync(langFile, JSON.stringify(messages, null, 4));
    }
};

module.exports = buildIntlMessages;
