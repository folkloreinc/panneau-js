const fs = require('fs');
/* eslint-disable import/no-extraneous-dependencies */
const glob = require('glob');
/* eslint-enable import/no-extraneous-dependencies */

module.exports = messagesPattern => (
    glob.sync(messagesPattern)
        .map(filename => fs.readFileSync(filename, 'utf8'))
        .map(file => JSON.parse(file))
        .reduce((collection, descriptors) => ({
            ...collection,
            ...(descriptors.reduce((messages, { id, defaultMessage }) => ({
                ...messages,
                [id]: defaultMessage,
            }), collection)),
        }), {})
);
