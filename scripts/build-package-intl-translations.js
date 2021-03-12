const path = require('path');
const { sync: globSync } = require('glob');
const buildIntlTranslations = require('./lib/buildIntlTranslations');
const addMissingTranslations = require('./lib/addMissingTranslations');

const MESSAGES_PATTERN = path.join(process.env.PWD, './intl/messages/**/*.json');
const LANG_FILE = path.join(process.env.PWD, './intl/locale/en.json');

buildIntlTranslations(MESSAGES_PATTERN, LANG_FILE);

const otherLangFiles = globSync(path.join(process.env.PWD, './intl/locale/*.json')).filter(
    (langPath) => path.basename(langPath, '.json') !== 'en',
);

addMissingTranslations(LANG_FILE, otherLangFiles);
