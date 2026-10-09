import type { Field } from '@panneau/core';

export const LOCALES = ['fr', 'en'];

const LOCALE_LABELS: Record<string, string> = {
    fr: 'FR',
    en: 'EN',
};

/**
 * Creates a localized field: one sub-field per locale, displayed with a locale switcher.
 *
 * ex: localized({ name: 'title', label: 'Titre', component: 'text' })
 * gives a value like { fr: '...', en: '...' }
 */
export function localized(
    { name, label, component = 'text', display = null, ...props }: Field & { display?: string },
    locales: string[] = LOCALES,
): Field {
    return {
        name,
        label,
        type: 'localized',
        component: 'localized',
        withoutFormGroup: true,
        ...(display !== null ? { components: { display } } : null),
        ...props,
        properties: locales.reduce(
            (properties, locale) => ({
                ...properties,
                [locale]: {
                    name: locale,
                    label: LOCALE_LABELS[locale] || locale.toUpperCase(),
                    component,
                },
            }),
            {},
        ),
    };
}

/**
 * Builds the intl values of a resource, used in all the resource messages
 * (ex: "Créer {a_singular}", "Voir {the_plural}")
 */
export function resourceValues({
    name,
    singular,
    plural,
    aSingular,
    aPlural = plural,
    theSingular,
    thePlural,
}: {
    name: string;
    singular: string;
    plural: string;
    aSingular: string;
    aPlural?: string;
    theSingular: string;
    thePlural: string;
}) {
    const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
    return {
        name,
        singular,
        plural,
        a_singular: aSingular,
        a_plural: aPlural,
        A_singular: capitalize(aSingular),
        A_plural: capitalize(aPlural),
        the_singular: theSingular,
        the_plural: thePlural,
        The_singular: capitalize(theSingular),
        The_plural: capitalize(thePlural),
    };
}

/**
 * Display of a value with options in a list (ex: "concert" -> "Concert")
 */
export function optionsLabelDisplay(options: { value: unknown; label: string }[]) {
    return {
        component: 'label',
        labels: options.reduce(
            (labels, { value, label }) => ({ ...labels, [`${value}`]: label }),
            {},
        ),
    };
}
