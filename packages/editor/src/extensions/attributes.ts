import { Extension } from '@tiptap/core';

/**
 * Marks the paragraphs of list items that were not written as a `<p>`, while the content is
 * serialized: a list item with one of them is written without it (`<li>Text</li>`), as CKEditor
 * writes it. It never reaches the value.
 */
export const IMPLICIT_PARAGRAPH = 'data-panneau-implicit';

/** What ProseMirror puts on content it copies, to paste it back: never kept. */
export const CLIPBOARD_SLICE = 'data-pm-slice';

/** What the field puts on content it copies, to know it when it is pasted: never kept. */
export const COPIED_FROM = 'data-panneau-copy';

/** Attributes that the field and ProseMirror add, which never reach the value. */
const INTERNAL_ATTRIBUTES = [IMPLICIT_PARAGRAPH, CLIPBOARD_SLICE, COPIED_FROM];

/**
 * The attributes that an extension handles itself, by type: they are not kept a second time.
 */
const OWN_ATTRIBUTES: Readonly<Record<string, readonly string[]>> = {
    orderedList: ['start', 'type'],
    link: ['href', 'target', 'rel', 'class', 'title'],
};

/** The nodes and marks of the field whose attributes are kept. */
export const KEPT_ATTRIBUTE_TYPES = [
    'paragraph',
    'heading',
    'blockquote',
    'bulletList',
    'orderedList',
    'listItem',
    'horizontalRule',
    'hardBreak',
    'link',
    'bold',
    'italic',
    'underline',
    'strike',
    'code',
    'subscript',
    'superscript',
] as const;

/**
 * Whether an attribute would run a script once rendered: an event handler (`onclick`), or a
 * `javascript:`, `vbscript:` or `data:text/html` URL, whatever the case and the whitespace and
 * control characters in it. Values are read from the DOM, so their entities are already decoded.
 */
export function isScriptAttribute(name: string, value: string): boolean {
    if (name.toLowerCase().startsWith('on')) {
        return true;
    }
    // Browsers skip whitespace and control characters in a URL's scheme
    const url = Array.from(value)
        .filter((character) => {
            const code = character.charCodeAt(0);
            return code > 0x20 && (code < 0x7f || code > 0x9f);
        })
        .join('')
        .toLowerCase();
    return /^(javascript|vbscript|data:text\/html)/.test(url);
}

/**
 * The attributes of an element, in their order, except those of `skip` and those that would run
 * a script (`isScriptAttribute()`). `null` without any.
 */
export function readAttributes(
    element: HTMLElement,
    skip: readonly string[] = [],
): Record<string, string> | null {
    const attributes = Array.from(element.attributes).filter(
        (attribute) =>
            !INTERNAL_ATTRIBUTES.includes(attribute.name) &&
            !skip.includes(attribute.name) &&
            !isScriptAttribute(attribute.name, attribute.value),
    );
    return attributes.length > 0
        ? Object.fromEntries(attributes.map((attribute) => [attribute.name, attribute.value]))
        : null;
}

/** The attributes kept on a node or a mark, in `htmlAttributes`. */
export function getHtmlAttributes(attrs: Record<string, unknown>): Record<string, string> {
    const value = attrs.htmlAttributes;
    return value !== null && typeof value === 'object' ? (value as Record<string, string>) : {};
}

/**
 * Keeps the attributes of the elements the field knows (`class`, `style`, `id`, `lang`, `data-*`),
 * in their order, so that content written by another editor keeps them once edited. Block styles
 * are classes among them. Also remembers which paragraphs of list items were written as a `<p>`.
 */
export const HtmlAttributes = Extension.create({
    name: 'htmlAttributes',

    addGlobalAttributes() {
        return [
            ...KEPT_ATTRIBUTE_TYPES.map((type) => ({
                types: [type],
                attributes: {
                    htmlAttributes: {
                        default: null,
                        // A new paragraph doesn't take the style of the one it splits from.
                        keepOnSplit: false,
                        parseHTML: (element: HTMLElement) =>
                            readAttributes(element, OWN_ATTRIBUTES[type]),
                        renderHTML: (attrs: Record<string, unknown>) => getHtmlAttributes(attrs),
                    },
                },
            })),
            {
                types: ['paragraph'],
                attributes: {
                    explicit: {
                        default: false,
                        parseHTML: (element: HTMLElement) =>
                            element.parentElement?.tagName === 'LI',
                        renderHTML: (attrs: Record<string, unknown>) =>
                            attrs.explicit === true ? {} : { [IMPLICIT_PARAGRAPH]: '' },
                    },
                },
            },
        ];
    },
});
