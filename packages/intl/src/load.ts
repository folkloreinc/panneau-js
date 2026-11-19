import type { MessageCatalog } from './message';

/** The catalogs of the languages Panneau translates, loaded on first use. English needs none. */
const LOADERS: Readonly<Record<string, () => Promise<MessageCatalog>>> = {
    fr: async () => (await import('./fr/index')).fr,
};

const loaded = new Map<string, MessageCatalog>();
const loading = new Map<string, Promise<MessageCatalog>>();

/** The language of a locale that Panneau translates (`fr` for `fr-CA`), or `null`. */
function translatedLanguage(locale: string): string | null {
    const language = locale.split('-')[0] ?? locale;
    return locale in LOADERS ? locale : language in LOADERS ? language : null;
}

/**
 * Loads the messages of every Panneau package for a locale, with an `import()` the first time
 * (#346), so that an app only loads the languages it shows. A regional locale (`fr-CA`) gets the
 * messages of its language. English, and a locale Panneau doesn't translate, get none: components
 * use their English defaults.
 */
export function loadPanneauMessages(locale: string): Promise<MessageCatalog> {
    const language = translatedLanguage(locale);
    const load = language !== null ? LOADERS[language] : undefined;
    if (language === null || load === undefined) {
        return Promise.resolve({});
    }
    const catalog = loaded.get(language);
    if (catalog !== undefined) {
        return Promise.resolve(catalog);
    }
    let promise = loading.get(language);
    if (promise === undefined) {
        promise = load().then(
            (messages) => {
                loaded.set(language, messages);
                loading.delete(language);
                return messages;
            },
            (error: unknown) => {
                loading.delete(language);
                throw error;
            },
        );
        loading.set(language, promise);
    }
    return promise;
}

/**
 * The messages of every Panneau package for a locale, when they need no loading or are loaded
 * (`loadPanneauMessages()`), or `undefined` while they still have to load.
 */
export function getLoadedPanneauMessages(locale: string): MessageCatalog | undefined {
    const language = translatedLanguage(locale);
    return language === null ? {} : loaded.get(language);
}
