import { type Mark, mergeAttributes } from '@tiptap/core';
import { Bold } from '@tiptap/extension-bold';
import { Code } from '@tiptap/extension-code';
import { Italic } from '@tiptap/extension-italic';
import { Strike } from '@tiptap/extension-strike';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Underline } from '@tiptap/extension-underline';
import type { TagParseRule } from '@tiptap/pm/model';

/**
 * A mark that is written with the element it was read from: `<b>` stays `<b>` and `<i>` stays
 * `<i>` (CKEditor 5 writes italics as `<i>`), and new marks use `tag`. Only elements are read:
 * styles (`font-weight: bold` on a `<span>`) stay on their element.
 */
function keepTag<Options extends { HTMLAttributes: Record<string, unknown> }>(
    mark: Mark<Options>,
    tag: string,
    rules: readonly TagParseRule[],
): Mark<Options> {
    return mark.extend({
        addAttributes() {
            return {
                ...this.parent?.(),
                tag: {
                    default: null,
                    rendered: false,
                    parseHTML: (element: HTMLElement) => {
                        const name = element.tagName.toLowerCase();
                        return name === tag ? null : name;
                    },
                },
            };
        },
        parseHTML() {
            return [...rules];
        },
        renderHTML({ mark: node, HTMLAttributes }) {
            const name = typeof node.attrs.tag === 'string' ? node.attrs.tag : tag;
            return [name, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
        },
    });
}

/** The marks of the field: bold, italic, underline, strikethrough, code, subscript, superscript. */
export const markExtensions = [
    keepTag(Bold, 'strong', [
        { tag: 'strong' },
        // Google Docs wraps pasted content in `<b style="font-weight: normal">`.
        { tag: 'b', getAttrs: (node) => node.style.fontWeight !== 'normal' && null },
    ]),
    keepTag(Italic, 'em', [{ tag: 'em' }, { tag: 'i' }]),
    keepTag(Underline, 'u', [{ tag: 'u' }]),
    keepTag(Strike, 's', [{ tag: 's' }, { tag: 'del' }, { tag: 'strike' }]),
    keepTag(Code, 'code', [{ tag: 'code' }]),
    keepTag(Subscript, 'sub', [{ tag: 'sub' }]),
    keepTag(Superscript, 'sup', [{ tag: 'sup' }]),
];
