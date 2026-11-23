import { Mark, Node } from '@tiptap/core';
import type { DOMOutputSpec } from '@tiptap/pm/model';

import {
    CLIPBOARD_SLICE,
    COPIED_FROM,
    KEPT_HTML,
    readAttributes,
    withoutScriptAttributes,
} from './attributes';

/**
 * Elements the field doesn't edit, kept as they were written: embedded media (`<figure
 * class="media">` of CKEditor 5, iframes, scripts of social posts), tables, images, `<div>`.
 */
const BLOCK_TAGS = [
    'address',
    'article',
    'aside',
    'center',
    'details',
    'div',
    'dl',
    'fieldset',
    'figure',
    'footer',
    'form',
    'header',
    'nav',
    'oembed',
    'pre',
    'section',
    'style',
    'table',
];

/** Elements kept as they were written, in the text, or as blocks between paragraphs. */
const INLINE_TAGS = [
    'audio',
    'button',
    'canvas',
    'embed',
    'iframe',
    'img',
    'input',
    'math',
    'noscript',
    'object',
    'picture',
    'script',
    'select',
    'svg',
    'textarea',
    'video',
];

/** Quotes that embed a post: they come with the script of their provider. */
const EMBED_QUOTES = [
    'blockquote.twitter-tweet',
    'blockquote.twitter-video',
    'blockquote.instagram-media',
    'blockquote.tiktok-embed',
    'blockquote.imgur-embed-pub',
];

/** Elements around text, kept with their attributes: `<span style="…">`, `<abbr title="…">`. */
const MARK_TAGS = [
    'span',
    'font',
    'small',
    'big',
    'abbr',
    'acronym',
    'cite',
    'q',
    'dfn',
    'time',
    'mark',
    'ins',
    'kbd',
    'samp',
    'var',
    'bdi',
    'bdo',
    'data',
    'tt',
    'a:not([href])',
];

/** The elements of `MARK_TAGS`: what a kept mark can be written as. */
const MARK_NAMES = new Set(MARK_TAGS.map((tag) => tag.replace(/:.*$/, '')));

/** What kept HTML is, as the editor names it to writers. */
export type KeptHtmlKind =
    'video' | 'audio' | 'image' | 'post' | 'embed' | 'table' | 'form' | 'code' | 'script' | 'style';

export interface HtmlNodeOptions {
    /** Names kept HTML of no known kind (a `<div>`): "HTML kept as is". */
    label: string;
    /** Names each kind of kept HTML: "Embedded video", "Table". Kinds left out use `label`. */
    labels: Partial<Readonly<Record<KeptHtmlKind, string>>>;
    /** Class name of the element that stands for kept HTML in the editor. */
    className: string;
}

/**
 * Where kept HTML goes when ProseMirror renders a node without its view: an empty element that
 * holds the HTML in an attribute, where nothing runs. ProseMirror does that when the editor
 * unmounts, with the editor still in the page. `restoreKeptHtml()` puts the HTML back, only in
 * what the field writes: the value, and what it copies.
 */
function placeholder(html: string, inline: boolean): DOMOutputSpec {
    return [inline ? 'span' : 'div', { [KEPT_HTML]: html }];
}

/**
 * Replaces the placeholders of kept HTML with the HTML they hold, in content written outside the
 * page: an inert document, or a fragment of one.
 */
export function restoreKeptHtml(root: ParentNode): void {
    // Only the empty placeholders the field wrote: content never brings the attribute
    root.querySelectorAll(`[${KEPT_HTML}]:empty`).forEach((element) => {
        const template = element.ownerDocument.createElement('template');
        template.innerHTML = element.getAttribute(KEPT_HTML) ?? '';
        element.replaceWith(...Array.from(template.content.childNodes));
    });
}

/** `figure.media`: the element and its first class, for developers. */
function describe(element: Element): string {
    const name = element.tagName.toLowerCase();
    const className = element.classList[0];
    return className !== undefined ? `${name}.${className}` : name;
}

/** The URL that kept HTML points to: of its media or post. */
function getSource(element: Element): string | null {
    const source = [element, ...Array.from(element.querySelectorAll('*'))]
        .map(
            (candidate) =>
                candidate.getAttribute('data-oembed-url') ??
                candidate.getAttribute('url') ??
                candidate.getAttribute('src') ??
                candidate.getAttribute('cite') ??
                candidate.getAttribute('href'),
        )
        .find((value) => value !== null && value !== '');
    return source ?? null;
}

/** What kept HTML points to: the URL of its media or post, or the start of its text. */
function summarize(element: Element): string {
    const source = getSource(element);
    if (source !== null) {
        return source;
    }
    const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
    return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

/** Providers of embeds that writers know by name, and what they embed. */
const PROVIDERS: readonly { name: string; hosts: readonly string[]; kind: KeptHtmlKind }[] = [
    { name: 'YouTube', hosts: ['youtube.com', 'youtu.be', 'youtube-nocookie.com'], kind: 'video' },
    { name: 'Vimeo', hosts: ['vimeo.com'], kind: 'video' },
    { name: 'Dailymotion', hosts: ['dailymotion.com', 'dai.ly'], kind: 'video' },
    { name: 'TikTok', hosts: ['tiktok.com'], kind: 'video' },
    { name: 'X', hosts: ['twitter.com', 'x.com'], kind: 'post' },
    { name: 'Instagram', hosts: ['instagram.com'], kind: 'post' },
    { name: 'Facebook', hosts: ['facebook.com'], kind: 'post' },
    { name: 'Imgur', hosts: ['imgur.com'], kind: 'post' },
    { name: 'SoundCloud', hosts: ['soundcloud.com'], kind: 'audio' },
    { name: 'Spotify', hosts: ['spotify.com'], kind: 'audio' },
];

/** The provider of a URL, by its host and the hosts above it. */
function getProvider(url: string | null) {
    if (url === null) {
        return undefined;
    }
    let host: string;
    try {
        host = new URL(url, 'https://localhost').hostname.toLowerCase();
    } catch {
        return undefined;
    }
    return PROVIDERS.find((provider) =>
        provider.hosts.some((candidate) => host === candidate || host.endsWith(`.${candidate}`)),
    );
}

const EMBED_TAGS = new Set(['iframe', 'embed', 'object', 'oembed']);
const FORM_TAGS = new Set(['form', 'fieldset', 'input', 'select', 'textarea', 'button']);
const IMAGE_TAGS = new Set(['img', 'picture', 'svg', 'canvas']);

/** What kept HTML is, from its element, its class and its provider. `null` for a `<div>`. */
function getKind(element: Element, providerKind: KeptHtmlKind | undefined): KeptHtmlKind | null {
    const name = element.tagName.toLowerCase();
    const has = (selector: string) => element.querySelector(selector) !== null;
    if (name === 'blockquote') {
        return 'post';
    }
    if (providerKind !== undefined && name !== 'a') {
        return providerKind;
    }
    if (name === 'video' || name === 'audio') {
        return name;
    }
    if (
        EMBED_TAGS.has(name) ||
        element.classList.contains('media') ||
        element.hasAttribute('data-oembed-url') ||
        has('iframe, embed, object, oembed, [data-oembed-url]')
    ) {
        return 'embed';
    }
    if (IMAGE_TAGS.has(name) || (name === 'figure' && has('img, picture, svg'))) {
        return 'image';
    }
    if (name === 'table' || (name === 'figure' && has('table'))) {
        return 'table';
    }
    if (FORM_TAGS.has(name)) {
        return 'form';
    }
    if (name === 'pre') {
        return 'code';
    }
    if (name === 'script' || name === 'noscript') {
        return 'script';
    }
    return name === 'style' ? 'style' : null;
}

/** The words of an image: its text alternative, or its URL. */
function describeImage(element: Element): string {
    const image = element.matches('img') ? element : element.querySelector('img');
    const alt = image?.getAttribute('alt')?.trim() ?? '';
    return alt !== '' ? alt : summarize(element);
}

/**
 * Shows kept HTML in the editor without rendering it: what it is in words ("Embedded video"),
 * then its provider and what it points to. A video of a known provider shows a player, drawn by
 * the editor, without loading anything. Its element and class are in a tooltip, for developers.
 * Its markup only goes back to the value.
 */
function createHtmlView(html: string, options: HtmlNodeOptions, inline: boolean) {
    const template = document.createElement('template');
    template.innerHTML = html;
    const element = template.content.firstElementChild;
    const dom = document.createElement(inline ? 'span' : 'div');
    dom.className = options.className;
    dom.contentEditable = 'false';
    dom.setAttribute('role', 'img');
    const provider = element !== null ? getProvider(getSource(element)) : undefined;
    const kind = element !== null ? getKind(element, provider?.kind) : null;
    const label = (kind !== null ? options.labels[kind] : undefined) ?? options.label;
    const summary =
        element === null ? '' : kind === 'image' ? describeImage(element) : summarize(element);
    dom.setAttribute(
        'aria-label',
        [label, provider?.name ?? '', summary].filter((part) => part !== '').join(', '),
    );
    if (element !== null) {
        dom.title = describe(element);
    }
    if (kind !== null) {
        dom.dataset.kind = kind;
    }
    if (!inline && kind === 'video' && provider !== undefined) {
        const player = document.createElement('span');
        player.dataset.player = '';
        dom.append(player);
    }
    const text = document.createElement('span');
    text.dataset.text = '';
    const name = document.createElement('strong');
    name.textContent = label;
    text.append(name);
    const detail = [provider?.name, summary].filter(
        (part): part is string => part !== undefined && part !== '',
    );
    if (detail.length > 0) {
        const line = document.createElement('span');
        line.textContent = detail.join(' · ');
        text.append(line);
    }
    dom.append(text);
    return { dom };
}

/** The HTML of an element as it was written, without what copying adds to it. */
function outerHtml(element: HTMLElement): string {
    if (!element.hasAttribute(CLIPBOARD_SLICE) && !element.hasAttribute(COPIED_FROM)) {
        return element.outerHTML;
    }
    const copy = element.cloneNode(true) as HTMLElement;
    copy.removeAttribute(CLIPBOARD_SLICE);
    copy.removeAttribute(COPIED_FROM);
    return copy.outerHTML;
}

const htmlAttribute = {
    html: {
        default: '',
        rendered: false,
        parseHTML: outerHtml,
    },
};

/** A block of HTML that the field keeps as it was written. */
export const HtmlBlock = Node.create<HtmlNodeOptions>({
    name: 'htmlBlock',
    group: 'block',
    atom: true,
    selectable: true,
    draggable: true,

    addOptions() {
        return { label: 'HTML', labels: {}, className: '' };
    },

    addAttributes() {
        return htmlAttribute;
    },

    parseHTML() {
        return [
            // Above the quotes of the field
            { tag: EMBED_QUOTES.join(', '), priority: 60 },
            // Below the elements of the field and of plugins
            { tag: BLOCK_TAGS.join(', '), priority: 10 },
            // An image or a video between paragraphs stays between them
            { tag: INLINE_TAGS.join(', '), priority: 11, context: 'doc/|blockquote/' },
        ];
    },

    renderHTML({ node }) {
        return placeholder(String(node.attrs.html), false);
    },

    addNodeView() {
        return ({ node }) => createHtmlView(String(node.attrs.html), this.options, false);
    },
});

/** An element of HTML in the text that the field keeps as it was written: an image, an iframe. */
export const HtmlInline = Node.create<HtmlNodeOptions>({
    name: 'htmlInline',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,

    addOptions() {
        return { label: 'HTML', labels: {}, className: '' };
    },

    addAttributes() {
        return htmlAttribute;
    },

    parseHTML() {
        return [
            { tag: INLINE_TAGS.join(', '), priority: 10 },
            // Around no text, they can't be marks: an anchor, the logo of a plugin left out.
            { tag: MARK_TAGS.map((tag) => `${tag}:empty`).join(', '), priority: 20 },
        ];
    },

    renderHTML({ node }) {
        return placeholder(String(node.attrs.html), true);
    },

    addNodeView() {
        return ({ node }) => createHtmlView(String(node.attrs.html), this.options, true);
    },
});

/**
 * An element around text that the field keeps with its attributes: `<span style="…">`, `<abbr
 * title="…">`, an anchor without `href`. A `<span>` without attributes is dropped, as browsers
 * render it the same.
 */
export const HtmlMark = Mark.create({
    name: 'htmlMark',
    // Elements of several kinds nest: `<abbr><span>`.
    excludes: '',
    priority: 500,

    addAttributes() {
        return {
            tag: {
                default: 'span',
                rendered: false,
                parseHTML: (element: HTMLElement) => element.tagName.toLowerCase(),
            },
            attributes: {
                default: null,
                rendered: false,
                parseHTML: (element: HTMLElement) => readAttributes(element),
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: MARK_TAGS.join(', '),
                priority: 10,
                getAttrs: (element: HTMLElement) =>
                    element.tagName === 'SPAN' && readAttributes(element) === null ? false : null,
            },
        ];
    },

    renderHTML({ mark }) {
        const tag = String(mark.attrs.tag);
        return [
            MARK_NAMES.has(tag) ? tag : 'span',
            withoutScriptAttributes(mark.attrs.attributes),
            0,
        ];
    },
});
