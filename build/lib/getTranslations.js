const fs = require('fs');
const glob = require('glob');
const sortTranslations = require('./sortTranslations');

module.exports = (messagesPattern) => {
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
    return sortTranslations(messages);
};
