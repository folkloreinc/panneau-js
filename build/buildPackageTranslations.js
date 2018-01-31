const path = require('path');
const buildTranslations = require('./lib/buildTranslations');

const MESSAGES_PATTERN = path.join(process.env.PWD, './intl/messages/**/*.json');
const LANG_FILE = path.join(process.env.PWD, './intl/lang/en.json');

buildTranslations(MESSAGES_PATTERN, LANG_FILE);
