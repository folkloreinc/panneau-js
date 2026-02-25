function sortIntlMessages(messages) {
    return Object.keys(messages)
        .sort()
        .reduce(
            (allMessages, key) => ({
                ...allMessages,
                [key]: messages[key],
            }),
            {},
        );
}

module.exports = sortIntlMessages;
