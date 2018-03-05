const sortTranslations = messages => Object.keys(messages).sort().reduce((allMessages, key) => ({
    ...allMessages,
    [key]: messages[key],
}), {});

module.exports = sortTranslations;
