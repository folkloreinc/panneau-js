// The types of `link` values and their new tabs (decision 0055). This module doesn't import zod.
import { BUILT_IN_LINK_TYPES, type BuiltInLinkType } from './constants';
import type { Field } from './schemas/field';
import { isRecord } from './values';

/** A type of a `link` field: a built-in one, or one that a site adds in `settings.types`. */
export interface LinkType {
    /** `url`, `page`, `email`, `tel`, `file`, or the id of a site's type (`anchor`). */
    id: string;
    /** The name of a site's type. Built-in types are named by the client. */
    label?: string;
    /** A site's type: the pattern its `url` must match. */
    pattern?: string;
    /** A site's type: the placeholder of its input. */
    placeholder?: string;
}

/** Which links open in a new tab: as the user chooses, by their type, or none. */
export type LinkNewTab = 'choose' | 'external' | 'never';

/** Whether a type of link is built in. */
export function isBuiltInLinkType(type: string): type is BuiltInLinkType {
    return (BUILT_IN_LINK_TYPES as readonly string[]).includes(type);
}

/**
 * The types a `link` field offers, in order: those of `settings.types`, or `url`, `email` and
 * `tel`, after `page` when the field has a `resource`. A `page` type without a `resource` is left
 * out, as are entries that aren't a built-in name nor a type with an `id`.
 */
export function getLinkTypes(field: Pick<Field, 'resource' | 'settings'>): LinkType[] {
    const hasPages = field.resource !== undefined;
    const setting = field.settings?.types;
    const entries: unknown[] = Array.isArray(setting)
        ? setting
        : [...(hasPages ? ['page'] : []), 'url', 'email', 'tel'];
    const types: LinkType[] = [];
    entries.forEach((entry) => {
        let type: LinkType | null = null;
        if (typeof entry === 'string' && isBuiltInLinkType(entry)) {
            type = { id: entry };
        } else if (isRecord(entry) && typeof entry.id === 'string' && entry.id !== '') {
            type = {
                id: entry.id,
                ...(typeof entry.label === 'string' ? { label: entry.label } : {}),
                ...(typeof entry.pattern === 'string' ? { pattern: entry.pattern } : {}),
                ...(typeof entry.placeholder === 'string'
                    ? { placeholder: entry.placeholder }
                    : {}),
            };
        }
        if (
            type !== null &&
            (type.id !== 'page' || hasPages) &&
            !types.some((other) => other.id === type.id)
        ) {
            types.push(type);
        }
    });
    return types;
}

/** The `newTab` setting of a `link` field: `choose` without one. */
export function getLinkNewTab(field: Pick<Field, 'settings'>): LinkNewTab {
    const setting = field.settings?.newTab;
    return setting === 'external' || setting === 'never' ? setting : 'choose';
}

/** Whether a URL points to another site: `https://…`, `http://…` or `//…`. */
export function isExternalUrl(url: string): boolean {
    return /^(https?:)?\/\//i.test(url.trim());
}

/**
 * Whether a link opens in a new tab: the user's choice with `choose`, never with `never`, and with
 * `external`, `true` for `url` and `file` links, `false` for `page`, `email` and `tel` links, and
 * for a site's types, whether their URL points to another site.
 */
export function resolveLinkNewTab(
    newTab: LinkNewTab,
    link: { type?: unknown; url?: unknown; newTab?: unknown },
): boolean {
    if (newTab === 'never') {
        return false;
    }
    if (newTab === 'choose') {
        return link.newTab === true;
    }
    switch (link.type) {
        case 'url':
        case 'file':
            return true;
        case 'page':
        case 'email':
        case 'tel':
            return false;
        default:
            return typeof link.url === 'string' && isExternalUrl(link.url);
    }
}
