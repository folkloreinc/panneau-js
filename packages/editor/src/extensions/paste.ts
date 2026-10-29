import { Extension } from '@tiptap/core';
import {
    DOMParser,
    type ParseOptions,
    type ParseRule,
    type Schema,
    type Slice,
    type TagParseRule,
} from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';

import { CLIPBOARD_SLICE } from './attributes';

/** What the field keeps as it was written, which pasted content doesn't bring. */
const KEPT_AS_WRITTEN = new Set(['htmlBlock', 'htmlInline', 'htmlMark']);

/** The attributes of a rule's result, without the attributes kept from the HTML. */
function withoutHtmlAttributes(rule: ParseRule): ParseRule {
    if (!('tag' in rule)) {
        return rule;
    }
    const tagRule = rule as TagParseRule;
    const { getAttrs } = tagRule;
    if (getAttrs === undefined) {
        return rule;
    }
    const next: TagParseRule = {
        ...tagRule,
        getAttrs: (node: HTMLElement) => {
            const attrs = getAttrs(node);
            if (attrs === null || attrs === false) {
                return attrs;
            }
            const { htmlAttributes: _htmlAttributes, ...others } = attrs;
            return others;
        },
    };
    return next;
}

/** Pasted content within the editor, or from another ProseMirror editor, is read in full. */
class PasteParser extends DOMParser {
    constructor(
        schema: Schema,
        rules: readonly ParseRule[],
        private readonly full: DOMParser,
    ) {
        super(schema, rules);
    }

    override parseSlice(dom: globalThis.Node, options?: ParseOptions): Slice {
        return dom instanceof Element &&
            (dom.hasAttribute(CLIPBOARD_SLICE) ||
                dom.querySelector(`[${CLIPBOARD_SLICE}]`) !== null)
            ? this.full.parseSlice(dom, options)
            : super.parseSlice(dom, options);
    }
}

/**
 * The parser of pasted content: what the toolbar can make, without the attributes and the HTML
 * that loaded content keeps, so that a page or a document pasted brings its text, its structure
 * and its marks, not its styles (`<span style="font-size: 11pt">` of Google Docs). Bold and
 * italic written as styles become marks. Content copied from a ProseMirror editor is read in full.
 */
export function createPasteParser(schema: Schema): DOMParser {
    const full = DOMParser.fromSchema(schema);
    const rules = full.rules
        .filter(
            (rule) =>
                !KEPT_AS_WRITTEN.has(('node' in rule ? rule.node : undefined) ?? rule.mark ?? ''),
        )
        .map(withoutHtmlAttributes);
    const styles: ParseRule[] = [
        ...(schema.marks.bold !== undefined
            ? [
                  {
                      style: 'font-weight',
                      mark: 'bold',
                      getAttrs: (value: string) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
                  },
              ]
            : []),
        ...(schema.marks.italic !== undefined
            ? [{ style: 'font-style=italic', mark: 'italic' }]
            : []),
    ];
    return new PasteParser(schema, [...rules, ...styles], full);
}

/**
 * Pasted content brings what the toolbar can make, not the styles of its page
 * (`createPasteParser()`).
 */
export const Paste = Extension.create({
    name: 'paste',
    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('panneauPaste'),
                props: { clipboardParser: createPasteParser(this.editor.schema) },
            }),
        ];
    },
});
