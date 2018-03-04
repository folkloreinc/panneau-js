const fs = require('fs');
/* eslint-disable import/no-extraneous-dependencies */
const glob = require('glob');
/* eslint-enable import/no-extraneous-dependencies */
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
