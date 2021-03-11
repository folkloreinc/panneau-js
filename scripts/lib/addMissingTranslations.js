const fs = require('fs');
const sortIntlMessages = require('./sortIntlMessages');

const addMissingTranslations = (baseLangFile, otherLangFiles) => {
    if (!fs.existsSync(baseLangFile)) {
        return;
    }
    const baseTranslations = require(baseLangFile);
    otherLangFiles.forEach((langPath) => {
        const translations = require(langPath);
        const newTranslations = Object.keys(baseTranslations).reduce((map, key) => ({
            ...map,
            [key]: translations[key] || `TRANSLATE: ${baseTranslations[key]}`,
        }), {});
        const sortedTranslations = sortIntlMessages(newTranslations);
        fs.writeFileSync(langPath, JSON.stringify(sortedTranslations, null, 4));
    })
};

module.exports = addMissingTranslations;
