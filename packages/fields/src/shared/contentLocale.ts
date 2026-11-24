import { createContext, use, useState } from 'react';

/**
 * The language of the content that a form shows: the locale of every localized field in it. A form
 * provides it, with its language switch; outside a form, there is none, and each localized field
 * shows its first locale.
 */
export interface ContentLocale {
    /** The locale the form shows. */
    locale: string;
    /** Sets the locale of the form. */
    setLocale: (locale: string) => void;
    /**
     * Counts the changes of `locale`: a field switched on its own goes back to the form's locale
     * at the next change, even to the locale it had before.
     */
    changes: number;
}

/** The content locale of the closest form, or `null` outside a form with a language switch. */
export const ContentLocaleContext = createContext<ContentLocale | null>(null);

/** The content locale of the closest form, if any. */
export function useContentLocale(): ContentLocale | null {
    return use(ContentLocaleContext);
}

/**
 * The locale a localized field shows, among its `locales`: the one it was switched to on its own,
 * until the form's locale changes, or else the form's locale, or else its first locale.
 *
 * - `select()` switches the field on its own.
 * - `reveal()` shows a locale for an error: it moves the form's switch, which every localized
 *   field follows, this one included.
 */
export function useFieldLocale(locales: readonly string[]): {
    locale: string | undefined;
    select: (locale: string) => void;
    reveal: (locale: string) => void;
} {
    const content = useContentLocale();
    const [own, setOwn] = useState<{ locale: string; changes: number } | null>(null);
    const followed =
        content !== null && locales.includes(content.locale) ? content.locale : undefined;
    const ownLocale =
        own !== null && (content === null || own.changes === content.changes)
            ? own.locale
            : undefined;
    const wanted = ownLocale ?? followed;
    return {
        locale: wanted !== undefined && locales.includes(wanted) ? wanted : locales[0],
        select: (locale) => setOwn({ locale, changes: content?.changes ?? 0 }),
        reveal: (locale) => {
            if (content !== null) {
                setOwn(null);
                content.setLocale(locale);
            } else {
                setOwn({ locale, changes: 0 });
            }
        },
    };
}
