import { Extension } from '@tiptap/core';
import {
    DOMParser,
    DOMSerializer,
    type Fragment,
    type ParseOptions,
    type ParseRule,
    type Schema,
    type Slice,
    type TagParseRule,
} from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';

import { COPIED_FROM } from './attributes';

let copyToken: string | null = null;

/**
 * The token that the rich text fields of this page put on what they copy: random, so that no
 * other page or document can claim to come from them.
 */
export function getCopyToken(): string {
    copyToken ??= crypto.randomUUID();
    return copyToken;
}

/** Whether pasted content was copied from a rich text field of this page. */
function isCopiedHere(dom: globalThis.Node): boolean {
    if (!(dom instanceof Element)) {
        return false;
    }
    const selector = `[${COPIED_FROM}="${getCopyToken()}"]`;
    return dom.matches(selector) || dom.querySelector(selector) !== null;
}

/** Writes copied content as the field does, with the token of this page on its elements. */
class CopySerializer extends DOMSerializer {
    override serializeFragment(
        fragment: Fragment,
        options: { document?: Document } = {},
        target?: HTMLElement | DocumentFragment,
    ): HTMLElement | DocumentFragment {
        const result = super.serializeFragment(fragment, options, target);
        if (target === undefined) {
            result.childNodes.forEach((child) => {
                if (child.nodeType === 1) {
                    (child as Element).setAttribute(COPIED_FROM, getCopyToken());
                }
            });
        }
        return result;
    }
}

/** The serializer of copied content: `getCopyToken()` on its elements. */
export function createCopySerializer(schema: Schema): DOMSerializer {
    const { nodes, marks } = DOMSerializer.fromSchema(schema);
    return new CopySerializer(nodes, marks);
}

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

/** Pasted content copied from a rich text field of this page is read in full. */
class PasteParser extends DOMParser {
    constructor(
        schema: Schema,
        rules: readonly ParseRule[],
        private readonly full: DOMParser,
    ) {
        super(schema, rules);
    }

    override parseSlice(dom: globalThis.Node, options?: ParseOptions): Slice {
        return isCopiedHere(dom)
            ? this.full.parseSlice(dom, options)
            : super.parseSlice(dom, options);
    }
}

/**
 * The parser of pasted content: what the toolbar can make, without the attributes and the HTML
 * that loaded content keeps, so that a page or a document pasted brings its text, its structure
 * and its marks, not its styles (`<span style="font-size: 11pt">` of Google Docs). Bold and
 * italic written as styles become marks. Content copied from a rich text field of this page
 * (`getCopyToken()`), and only that, is read in full: kept HTML can't be brought in from
 * elsewhere, even by HTML that claims to come from a ProseMirror editor (`data-pm-slice`).
 * Attributes that would run a script are dropped in both cases.
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
                props: {
                    clipboardParser: createPasteParser(this.editor.schema),
                    clipboardSerializer: createCopySerializer(this.editor.schema),
                },
            }),
        ];
    },
});
