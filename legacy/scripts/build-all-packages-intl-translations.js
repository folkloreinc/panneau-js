const path = require('path');
const getPackagesPaths = require('./lib/getPackagesPaths');
const buildIntlTranslations = require('./lib/buildIntlTranslations');

getPackagesPaths().forEach((packagePath) => {
    const MESSAGES_PATTERN = path.join(packagePath, './intl/messages/**/*.json');
    const LANG_FILE = path.join(packagePath, './intl/locale/en.json');
    buildIntlTranslations(MESSAGES_PATTERN, LANG_FILE);
});
