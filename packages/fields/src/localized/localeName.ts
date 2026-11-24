import { usePanneauIntl } from '@panneau/ui';

/** The name of a locale in the UI's language, capitalized (`Français`, `English`). */
export function useLocaleName(): (locale: string) => string {
    const intl = usePanneauIntl();
    return (locale) => {
        let name: string | undefined;
        try {
            name = intl.formatDisplayName(locale, { type: 'language' });
        } catch {
            name = undefined;
        }
        const text = name ?? locale.toUpperCase();
        return text.charAt(0).toLocaleUpperCase(intl.locale) + text.slice(1);
    };
}
