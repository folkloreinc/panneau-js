// What the mock backend does with the items of a resource: queries, fields, media and previews.
import {
    IDS_FILTER,
    IDS_FILTER_LIMIT,
    ITEM_ACTION_ABILITIES,
    isBuiltInItemAction,
} from '../constants';
import { type ListQuery, isFilterRange, matchesFilterRange } from '../query';
import { ITEM_TYPE_KEY, getTypeFields, hasResourceTypes } from '../resourceTypes';
import type { ResourceInput } from '../schemas';
import type { EmbedValue, Item, MediaInfo, StoredFile } from '../schemas/api';
import { isRecord } from '../values';
import type { Values } from './types';

export const RESERVED_KEYS = new Set(['id', 'version', 'abilities']);

export function escapeHtml(text: string): string {
    return text.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
}

/** A plain page with the values of an item, as a `data:` URL, for iframe previews. */
export function defaultPreviewUrl(item: Item): string {
    const rows = Object.entries(item)
        .filter(([key]) => !RESERVED_KEYS.has(key))
        .map(
            ([key, value]) =>
                `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(typeof value === 'string' ? value : JSON.stringify(value))}</dd>`,
        )
        .join('');
    const html = `<!doctype html><meta charset="utf-8"><title>Preview</title><body style="font-family:system-ui;margin:2rem"><h1>Item ${escapeHtml(item.id)}</h1><dl>${rows}</dl></body>`;
    return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

/** What the mock knows of a URL to embed: a video of YouTube or Vimeo, or a web page. */
export function defaultEmbed(url: string): EmbedValue | null {
    if (!URL.canParse(url)) {
        return null;
    }
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return null;
    }
    const host = parsed.hostname.replace(/^www\./, '');
    const youtube =
        host === 'youtu.be'
            ? parsed.pathname.slice(1)
            : host.endsWith('youtube.com')
              ? parsed.searchParams.get('v')
              : null;
    if (youtube !== null && youtube !== '') {
        return {
            url,
            type: 'video',
            provider: 'YouTube',
            title: `YouTube video ${youtube}`,
            thumbnailUrl: `https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`,
            html: `<iframe src="https://www.youtube.com/embed/${youtube}" width="560" height="315" allowfullscreen></iframe>`,
            width: 560,
            height: 315,
        };
    }
    if (host === 'vimeo.com') {
        const id = parsed.pathname.split('/').filter(Boolean)[0] ?? '';
        return {
            url,
            type: 'video',
            provider: 'Vimeo',
            title: `Vimeo video ${id}`,
            html: `<iframe src="https://player.vimeo.com/video/${id}" width="640" height="360" allowfullscreen></iframe>`,
            width: 640,
            height: 360,
        };
    }
    return { url, type: 'link', provider: host, title: host };
}

export function searchableText(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }
    if (isRecord(value)) {
        return Object.values(value).map(searchableText).join(' ');
    }
    return '';
}

/** What a value sorts by: the start of a `daterange`, the amount of `money`, or its text. */
export function sortValue(value: unknown): unknown {
    if (!isRecord(value)) {
        return value;
    }
    if ('start' in value && 'end' in value) {
        return value.start ?? value.end;
    }
    if ('currency' in value && typeof value.amount === 'number') {
        return value.amount;
    }
    return searchableText(value);
}

export function compare(a: unknown, b: unknown): number {
    const left = sortValue(a);
    const right = sortValue(b);
    if (left === right) {
        return 0;
    }
    if (left === undefined || left === null) {
        return 1;
    }
    if (right === undefined || right === null) {
        return -1;
    }
    if (typeof left === 'number' && typeof right === 'number') {
        return left - right;
    }
    return String(left).localeCompare(String(right), undefined, { numeric: true });
}

export function applyQuery(items: Item[], query: Pick<ListQuery, 'filter' | 'q' | 'sort'>): Item[] {
    let result = items;
    Object.entries(query.filter ?? {}).forEach(([key, expected]) => {
        // Every list filters on the ids of its items (decision 0069).
        if (key === IDS_FILTER) {
            const ids = (Array.isArray(expected) ? expected : [expected])
                .map(String)
                .slice(0, IDS_FILTER_LIMIT);
            result = result.filter((item) => ids.includes(item.id));
            return;
        }
        if (isFilterRange(expected)) {
            result = result.filter((item) => matchesFilterRange(item[key], expected));
            return;
        }
        const accepted = (Array.isArray(expected) ? expected : [expected]).map(String);
        result = result.filter((item) => {
            // A filter that isn't a value of the item reads its `media`: `filter[type]=image`.
            const value =
                key in item ? item[key] : isRecord(item.media) ? item.media[key] : undefined;
            const values = Array.isArray(value) ? value : [value];
            return values.some((candidate) => accepted.includes(String(candidate)));
        });
    });
    if (query.q !== undefined && query.q !== '') {
        const terms = query.q.toLowerCase();
        result = result.filter((item) =>
            Object.entries(item)
                .filter(([key]) => !RESERVED_KEYS.has(key))
                .some(([, value]) => searchableText(value).toLowerCase().includes(terms)),
        );
    }
    const sort = query.sort ?? [];
    if (sort.length > 0) {
        result = [...result].sort((a, b) => {
            for (const part of sort) {
                const descending = part.startsWith('-');
                const key = descending ? part.slice(1) : part;
                const order = compare(a[key], b[key]);
                if (order !== 0) {
                    return descending ? -order : order;
                }
            }
            return 0;
        });
    }
    return result;
}

/** The type of a media, from its MIME type. */
export function mediaType(mime: string | null | undefined): string {
    const family = (mime ?? '').split('/')[0] ?? '';
    if (family === 'image' || family === 'video' || family === 'audio') {
        return family;
    }
    return mime === 'application/pdf' || family === 'text' ? 'document' : 'other';
}

/** What the mock computes about a stored file: no renditions, ready at once. */
export function mediaOf(file: StoredFile): MediaInfo {
    const type = mediaType(file.mime);
    return {
        type,
        mime: file.mime ?? null,
        size: file.size ?? null,
        url: file.url ?? null,
        thumbnailUrl: type === 'image' ? (file.url ?? null) : null,
        status: 'ready',
    };
}

/**
 * A media item with its own transform (its `transform` field) in its `media`, where references
 * give it to clients (decision 0031).
 */
export function withOwnTransform(resource: ResourceInput, item: Item): Item {
    if (resource.kind !== 'media' || !isRecord(item.media)) {
        return item;
    }
    const { transform: _previous, ...media } = item.media;
    return {
        ...item,
        media: isRecord(item.transform) ? { ...media, transform: item.transform } : media,
    };
}

/**
 * Whether an item allows an action, as clients read its abilities (decision 0040): a built-in item
 * action needs its ability (`delete`, `duplicate`…), and another action its id.
 */
export function allows(item: Item, actionId: string): boolean {
    const ability = isBuiltInItemAction(actionId) ? ITEM_ACTION_ABILITIES[actionId] : actionId;
    return item.abilities[ability] === true && item.abilities[actionId] !== false;
}

/**
 * An item with the values of the fields of `fields` only, when the list asks for some, and what
 * every item has: its id, version, abilities, type (decision 0077) and `media` (a media item).
 */
export function pickFields(
    resource: ResourceInput,
    item: Item,
    fields: readonly string[] | undefined,
): Item {
    if (fields === undefined || fields.length === 0) {
        return item;
    }
    return Object.fromEntries(
        Object.entries(item).filter(
            ([key]) =>
                RESERVED_KEYS.has(key) ||
                key === ITEM_TYPE_KEY ||
                (key === 'media' && resource.kind === 'media') ||
                fields.includes(key),
        ),
    ) as Item;
}

/** The names of the fields of a resource whose ability is `false` (decision 0046). */
export function fieldsWithout(resource: ResourceInput, ability: 'view' | 'update'): Set<string> {
    return new Set(
        resource.fields
            .filter((field) => field.abilities?.[ability] === false)
            .map((field) => field.name),
    );
}

/**
 * The resource as the items of a type see it (decision 0077): with the fields of the type after its
 * own. The resource itself without a type.
 */
export function withTypeFields(resource: ResourceInput, type: unknown): ResourceInput {
    return hasResourceTypes(resource)
        ? { ...resource, fields: getTypeFields(resource, type) }
        : resource;
}

/**
 * A body without the values of the fields the user can't see or update, and of the fields that
 * forms leave out (`notInForm`, decision 0071), which are ignored.
 */
export function writableValues(resource: ResourceInput, body: Values): Values {
    const ignored = new Set([
        ...fieldsWithout(resource, 'view'),
        ...fieldsWithout(resource, 'update'),
        ...resource.fields.filter((field) => field.notInForm === true).map((field) => field.name),
    ]);
    return Object.fromEntries(Object.entries(body).filter(([key]) => !ignored.has(key)));
}
