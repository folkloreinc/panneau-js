import intlManager from '../packages/intl/src/manager';
import enTranslations from '../packages/intl/lang/en.json';
import frTranslations from '../packages/intl/lang/fr.json';

// Registers the translations of the packages, like an app does with
// `import '@panneau/intl/locale/fr'`. The source files are used so the intl
// package doesn't need to be built.
const toMessages = (translations) =>
    Object.keys(translations).reduce(
        (messages, id) => ({ ...messages, [id]: translations[id].defaultMessage }),
        {},
    );

intlManager.addLocale('en', toMessages(enTranslations));
intlManager.addLocale('fr', toMessages(frTranslations));
