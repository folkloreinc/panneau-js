import { defineMessage } from '../message';

/**
 * The messages of `@panneau/editor`, with their English text, which is also the default one.
 * French is in `../fr/editor.ts`.
 */
export const editorMessages = {
    toolbar: defineMessage({ id: 'panneau.editor.toolbar', defaultMessage: 'Formatting' }),
    textStyle: defineMessage({ id: 'panneau.editor.textStyle', defaultMessage: 'Text style' }),
    paragraph: defineMessage({ id: 'panneau.editor.paragraph', defaultMessage: 'Paragraph' }),
    heading: defineMessage<{ level: number }>({
        id: 'panneau.editor.heading',
        defaultMessage: 'Heading {level}',
    }),
    blockStyle: defineMessage({ id: 'panneau.editor.blockStyle', defaultMessage: 'Style' }),
    noStyle: defineMessage({ id: 'panneau.editor.noStyle', defaultMessage: 'No style' }),
    bold: defineMessage({ id: 'panneau.editor.bold', defaultMessage: 'Bold' }),
    italic: defineMessage({ id: 'panneau.editor.italic', defaultMessage: 'Italic' }),
    underline: defineMessage({ id: 'panneau.editor.underline', defaultMessage: 'Underline' }),
    strike: defineMessage({ id: 'panneau.editor.strike', defaultMessage: 'Strikethrough' }),
    superscript: defineMessage({
        id: 'panneau.editor.superscript',
        defaultMessage: 'Superscript',
    }),
    subscript: defineMessage({ id: 'panneau.editor.subscript', defaultMessage: 'Subscript' }),
    code: defineMessage({ id: 'panneau.editor.code', defaultMessage: 'Code' }),
    link: defineMessage({ id: 'panneau.editor.link', defaultMessage: 'Link' }),
    bulletList: defineMessage({
        id: 'panneau.editor.bulletList',
        defaultMessage: 'Bulleted list',
    }),
    orderedList: defineMessage({
        id: 'panneau.editor.orderedList',
        defaultMessage: 'Numbered list',
    }),
    blockquote: defineMessage({ id: 'panneau.editor.blockquote', defaultMessage: 'Quote' }),
    horizontalRule: defineMessage({
        id: 'panneau.editor.horizontalRule',
        defaultMessage: 'Horizontal line',
    }),
    clear: defineMessage({ id: 'panneau.editor.clear', defaultMessage: 'Clear formatting' }),
    undo: defineMessage({ id: 'panneau.editor.undo', defaultMessage: 'Undo' }),
    redo: defineMessage({ id: 'panneau.editor.redo', defaultMessage: 'Redo' }),
    // The link dialog
    linkTitle: defineMessage({ id: 'panneau.editor.linkTitle', defaultMessage: 'Link' }),
    linkUrl: defineMessage({ id: 'panneau.editor.linkUrl', defaultMessage: 'URL' }),
    linkNewTab: defineMessage({
        id: 'panneau.editor.linkNewTab',
        defaultMessage: 'Open in a new tab',
    }),
    linkApply: defineMessage({ id: 'panneau.editor.linkApply', defaultMessage: 'Apply' }),
    linkRemove: defineMessage({ id: 'panneau.editor.linkRemove', defaultMessage: 'Remove link' }),
    linkCancel: defineMessage({ id: 'panneau.editor.linkCancel', defaultMessage: 'Cancel' }),
    /** Names HTML that the field keeps as it was written: an embed, a table. */
    html: defineMessage({ id: 'panneau.editor.html', defaultMessage: 'HTML kept as is' }),
};
