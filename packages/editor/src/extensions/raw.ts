import { Mark, Node } from '@tiptap/core';
import type { DOMOutputSpec } from '@tiptap/pm/model';

import {
    CLIPBOARD_SLICE,
    COPIED_FROM,
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

export interface HtmlNodeOptions {
    /** Names kept HTML in the editor, for assistive technologies: "HTML". */
    label: string;
    /** Class name of the element that stands for kept HTML in the editor. */
    className: string;
}

/**
 * Where kept HTML goes when ProseMirror renders a node without its view: an empty element that
 * holds the HTML in an attribute, where nothing runs. ProseMirror does that when the editor
 * unmounts, with the editor still in the page. `restoreKeptHtml()` puts the HTML back, only in
 * what the field writes: the value, and what it copies.
 */
export const KEPT_HTML = 'data-panneau-html';

function placeholder(html: string, inline: boolean): DOMOutputSpec {
    return [inline ? 'span' : 'div', { [KEPT_HTML]: html }];
}

/**
 * Replaces the placeholders of kept HTML with the HTML they hold, in content written outside the
 * page: an inert document, or a fragment of one.
 */
export function restoreKeptHtml(root: ParentNode): void {
    root.querySelectorAll(`[${KEPT_HTML}]`).forEach((element) => {
        const template = element.ownerDocument.createElement('template');
        template.innerHTML = element.getAttribute(KEPT_HTML) ?? '';
        element.replaceWith(...Array.from(template.content.childNodes));
    });
}

/** `figure.media`: the element and its first class. */
function describe(element: Element): string {
    const name = element.tagName.toLowerCase();
    const className = element.classList[0];
    return className !== undefined ? `${name}.${className}` : name;
}

/** What kept HTML points to: the URL of its media or post, or the start of its text. */
function summarize(element: Element): string {
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
    if (source !== undefined && source !== null) {
        return source;
    }
    const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
    return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

/**
 * Shows kept HTML in the editor without rendering it: its element and what it points to. Its
 * markup only goes back to the value.
 */
function createHtmlView(html: string, options: HtmlNodeOptions, inline: boolean) {
    const template = document.createElement('template');
    template.innerHTML = html;
    const element = template.content.firstElementChild;
    const dom = document.createElement(inline ? 'span' : 'div');
    dom.className = options.className;
    dom.contentEditable = 'false';
    dom.setAttribute('role', 'img');
    const name = element !== null ? describe(element) : '';
    const summary = element !== null ? summarize(element) : '';
    dom.setAttribute(
        'aria-label',
        [options.label, name, summary].filter((part) => part !== '').join(', '),
    );
    const tag = document.createElement('code');
    tag.textContent = name;
    dom.append(tag);
    if (summary !== '') {
        const detail = document.createElement('span');
        detail.textContent = summary;
        dom.append(detail);
    }
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
        return { label: 'HTML', className: '' };
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
        return { label: 'HTML', className: '' };
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
