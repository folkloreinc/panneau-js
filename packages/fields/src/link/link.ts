import type { LinkValue } from '@panneau/protocol';
import { type LinkNewTab, resolveLinkNewTab } from '@panneau/protocol/runtime';

export type { LinkValue };

/** A page of a link: its id, its resource, and its label. */
export interface LinkPage {
    id: string;
    resource?: string;
    label?: string;
}

/** Whether a value is a link: an object with a `type`. */
export function isLink(value: unknown): value is LinkValue {
    return (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        typeof (value as { type?: unknown }).type === 'string'
    );
}

/** The page of a link, as a reference: an id alone (`"12"`) has no label. */
export function getLinkPage(link: LinkValue | null | undefined): LinkPage | null {
    const page = link?.page;
    if (typeof page === 'string') {
        return page !== '' ? { id: page } : null;
    }
    return page !== undefined && page !== null && typeof page.id === 'string'
        ? {
              id: page.id,
              ...(typeof page.resource === 'string' ? { resource: page.resource } : {}),
              ...(typeof page.label === 'string' ? { label: page.label } : {}),
          }
        : null;
}

/** The label of a link in a locale: that locale's, the first filled one, or a string label. */
export function getLinkLabel(link: LinkValue | null | undefined, locale?: string): string | null {
    const label = link?.label;
    if (typeof label === 'string') {
        return label.trim() !== '' ? label : null;
    }
    if (label === null || label === undefined) {
        return null;
    }
    const language = locale?.split('-')[0];
    const own =
        (locale !== undefined ? label[locale] : undefined) ??
        (language !== undefined ? label[language] : undefined);
    if (typeof own === 'string' && own.trim() !== '') {
        return own;
    }
    return (
        Object.values(label).find((text) => typeof text === 'string' && text.trim() !== '') ?? null
    );
}

/**
 * What a link shows: its label in the locale, or the label of its page, or its URL without its
 * scheme (`example.com`, `info@example.com`, `+15145550199`).
 */
export function getLinkText(link: LinkValue | null | undefined, locale?: string): string | null {
    const label = getLinkLabel(link, locale);
    if (label !== null) {
        return label;
    }
    const page = getLinkPage(link);
    if (page !== null) {
        return page.label ?? page.id;
    }
    const url = link?.url;
    return typeof url === 'string' && url !== ''
        ? url.replace(/^(https?:\/\/|mailto:|tel:)/i, '').replace(/\/$/, '')
        : null;
}

function isEmptyLabel(label: LinkValue['label']): boolean {
    if (label === null || label === undefined) {
        return true;
    }
    if (typeof label === 'string') {
        return label.trim() === '';
    }
    return !Object.values(label).some((text) => typeof text === 'string' && text.trim() !== '');
}

/**
 * A link with the parts of its type only (`url`, or `page`, or `file`), its label when it has one,
 * and its `newTab` as the setting sets it. `null` when the link is of the first type of its field,
 * without a URL, a page, a file or a label.
 */
export function cleanLink(
    link: LinkValue,
    { newTab, defaultType }: { newTab: LinkNewTab; defaultType: string | undefined },
): LinkValue | null {
    const { type } = link;
    const next: LinkValue = { type };
    if (type === 'page' || type === 'file') {
        const target = link[type];
        if (target !== undefined && target !== null && target !== '') {
            next[type] = target as never;
        }
    } else if (typeof link.url === 'string' && link.url !== '') {
        next.url = link.url;
    }
    if (!isEmptyLabel(link.label)) {
        next.label = link.label ?? null;
    }
    next.newTab = resolveLinkNewTab(newTab, link);
    const empty = next.url === undefined && next.page === undefined && next.file === undefined;
    return empty && next.label === undefined && type === defaultType ? null : next;
}
