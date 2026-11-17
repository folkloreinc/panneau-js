import type { Definition, InterfaceLocale } from '@panneau/protocol';

/**
 * The languages of the switcher of the shell (decision 0082): the definition's `interfaceLocales`,
 * or none when there's only one.
 */
export function getInterfaceLocales(definition: Definition): InterfaceLocale[] {
    const locales = definition.interfaceLocales ?? [];
    return locales.length > 1 ? locales : [];
}

/** A backend's URL, with the path to come back to as `next`. */
export function withNext(url: string, next: string | undefined): string {
    if (next === undefined || next === '') {
        return url;
    }
    return `${url}${url.includes('?') ? '&' : '?'}next=${encodeURIComponent(next)}`;
}
