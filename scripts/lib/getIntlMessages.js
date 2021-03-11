const fs = require('fs');
const glob = require('glob');
const sortIntlMessages = require('./sortIntlMessages');

const getIntlMessages = (messagesPattern) => {
    const messages = glob.sync(messagesPattern)
        .map(filename => fs.readFileSync(filename, 'utf8'))
        .map(file => JSON.parse(file))
        .reduce((collection, descriptors) => ({
            ...collection,
            ...(descriptors.reduce((allMessages, { id, defaultMessage }) => ({
                ...allMessages,
                [id]: defaultMessage,
            }), collection)),
        }), {});
    return sortIntlMessages(messages);
};

module.exports = getIntlMessages;
