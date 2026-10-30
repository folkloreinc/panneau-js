import type { Field, RichTextSettings, RichTextStyle } from '@panneau/protocol';
import { RICH_TEXT_STYLE_ELEMENTS } from '@panneau/protocol/runtime';

export type { RichTextSettings, RichTextStyle };

/** Which links open in a new tab: as the user chooses, every link to another site, or none. */
export type NewTabLinks = 'choose' | 'external' | 'never';

/** The toolbar of a field without a `toolbar` setting. `style` only shows with styles. */
export const DEFAULT_TOOLBAR: readonly string[] = [
    'heading',
    'style',
    '|',
    'bold',
    'italic',
    'link',
    '|',
    'bulletList',
    'orderedList',
];

/** The heading levels of a field without a `headings` setting. */
export const DEFAULT_HEADINGS: readonly number[] = [2, 3, 4];

/** The options of a rich text field, read from the `settings` of its definition. */
export interface RichTextOptions {
    toolbar: readonly string[];
    headings: readonly number[];
    styles: readonly RichTextStyle[];
    newTab: NewTabLinks;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === 'string';

const isLevel = (value: unknown): value is number =>
    typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 6;

function isStyle(value: unknown): value is RichTextStyle {
    return (
        isRecord(value) &&
        isString(value.label) &&
        isString(value.class) &&
        value.class.trim() !== '' &&
        (value.element === undefined ||
            (RICH_TEXT_STYLE_ELEMENTS as readonly unknown[]).includes(value.element))
    );
}

/**
 * The options of a `richtext` field from its `settings` (`RichTextSettings` of the protocol).
 * Settings of the wrong type fall back to the defaults, and invalid entries are skipped, so that
 * a field always renders.
 */
export function getRichTextOptions(field: Pick<Field, 'settings'>): RichTextOptions {
    const settings = field.settings ?? {};
    const links = isRecord(settings.links) ? settings.links : {};
    return {
        toolbar: Array.isArray(settings.toolbar)
            ? settings.toolbar.filter(isString)
            : DEFAULT_TOOLBAR,
        headings: Array.isArray(settings.headings)
            ? settings.headings.filter(isLevel)
            : DEFAULT_HEADINGS,
        styles: Array.isArray(settings.styles) ? settings.styles.filter(isStyle) : [],
        newTab: links.newTab === 'external' || links.newTab === 'never' ? links.newTab : 'choose',
    };
}
