import type { AnyExtension } from '@tiptap/core';
import { Blockquote } from '@tiptap/extension-blockquote';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { Heading } from '@tiptap/extension-heading';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Link } from '@tiptap/extension-link';
import { BulletList, ListItem, ListKeymap, OrderedList } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Dropcursor, Gapcursor, Placeholder, UndoRedo } from '@tiptap/extensions';

import { HtmlAttributes } from './attributes';
import { markExtensions } from './marks';
import { HtmlBlock, HtmlInline, HtmlMark, type HtmlNodeOptions } from './raw';

/** Links with their `href` first, as editors write them. */
const KeptLink = Link.extend({
    renderHTML(props) {
        const [tag, attributes] = this.parent?.(props) as [string, Record<string, unknown>, 0];
        return [tag, { href: attributes.href, ...attributes }, 0];
    },
});

export interface RichTextExtensionsOptions {
    /** TipTap extensions of the project. One with the name of a built-in extension replaces it. */
    extensions?: readonly AnyExtension[];
    /** Text shown in the empty editor. */
    placeholder?: string;
    /** How kept HTML shows in the editor. */
    html?: Partial<HtmlNodeOptions>;
}

/**
 * The TipTap extensions of the rich text field. Their schema reads everything the field may hold,
 * whatever its toolbar offers: every heading level, the marks, attributes, and HTML it doesn't
 * edit, kept as it was written.
 */
export function createRichTextExtensions({
    extensions = [],
    placeholder,
    html = {},
}: RichTextExtensionsOptions = {}): AnyExtension[] {
    const builtIn: AnyExtension[] = [
        Document,
        Paragraph,
        Text,
        Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
        Blockquote,
        BulletList,
        OrderedList,
        ListItem,
        ListKeymap,
        HardBreak,
        HorizontalRule,
        ...markExtensions,
        KeptLink.configure({
            // Links are added through the toolbar: typing or pasting a URL keeps it as text.
            autolink: false,
            linkOnPaste: false,
            openOnClick: false,
            // No `target` or `rel` on every link: they are set per link.
            HTMLAttributes: { target: null, rel: null, class: null },
        }),
        HtmlAttributes,
        HtmlBlock.configure(html),
        HtmlInline.configure(html),
        HtmlMark,
        UndoRedo,
        Dropcursor,
        Gapcursor,
        ...(placeholder !== undefined && placeholder !== ''
            ? [Placeholder.configure({ placeholder })]
            : []),
    ];
    const replaced = new Set(extensions.map((extension) => extension.name));
    return [...builtIn.filter((extension) => !replaced.has(extension.name)), ...extensions];
}

export { HtmlAttributes, HtmlBlock, HtmlInline, HtmlMark };
