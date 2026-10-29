import type { Editor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { EditorState } from '@tiptap/pm/state';

import type { RichTextStyle } from '@panneau/protocol';

import { getHtmlAttributes } from './extensions/attributes';

/** The element a node is written as: `p`, `h2`, `li`. */
export function elementOf(node: ProseMirrorNode): string | null {
    switch (node.type.name) {
        case 'paragraph':
            return 'p';
        case 'heading':
            return `h${String(node.attrs.level)}`;
        case 'blockquote':
            return 'blockquote';
        case 'bulletList':
            return 'ul';
        case 'orderedList':
            return 'ol';
        case 'listItem':
            return 'li';
        default:
            return null;
    }
}

const elementOfStyle = (style: RichTextStyle) => style.element ?? 'p';
const classesOf = (value: string | undefined) =>
    (value ?? '').split(/\s+/).filter((name) => name !== '');

interface Target {
    pos: number;
    node: ProseMirrorNode;
}

/**
 * The nodes a style applies to: the paragraphs and headings of the selection, or the closest
 * quote, list or list item around it.
 */
function findTargets(state: EditorState, element: string): Target[] {
    const { from, to, $from } = state.selection;
    if (element === 'p' || /^h[1-6]$/.test(element)) {
        const targets: Target[] = [];
        state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.isTextblock && elementOf(node) === element) {
                targets.push({ pos, node });
            }
        });
        return targets;
    }
    for (let depth = $from.depth; depth > 0; depth -= 1) {
        const node = $from.node(depth);
        if (elementOf(node) === element) {
            return [{ pos: $from.before(depth), node }];
        }
    }
    return [];
}

/** Whether a node has the classes of a style. */
function hasStyle(node: ProseMirrorNode, style: RichTextStyle): boolean {
    const classes = classesOf(getHtmlAttributes(node.attrs).class);
    const wanted = classesOf(style.class);
    return wanted.length > 0 && wanted.every((name) => classes.includes(name));
}

/** Whether a style can apply to the selection. */
export function canApplyStyle(state: EditorState, style: RichTextStyle): boolean {
    return findTargets(state, elementOfStyle(style)).length > 0;
}

/** The style of the selection: the first one that all its targets have. */
export function getActiveStyle(
    state: EditorState,
    styles: readonly RichTextStyle[],
): RichTextStyle | null {
    return (
        styles.find((style) => {
            const targets = findTargets(state, elementOfStyle(style));
            return targets.length > 0 && targets.every(({ node }) => hasStyle(node, style));
        }) ?? null
    );
}

/**
 * Puts a style on the selection, in place of the other styles of its element, or removes the
 * styles of the paragraphs and headings of the selection with `null`. Other classes stay.
 */
export function applyStyle(
    editor: Editor,
    style: RichTextStyle | null,
    styles: readonly RichTextStyle[],
): void {
    const { state } = editor;
    const elements =
        style !== null
            ? [elementOfStyle(style)]
            : [...new Set(styles.map(elementOfStyle))].filter(
                  (element) => element === 'p' || /^h[1-6]$/.test(element),
              );
    const { tr } = state;
    elements.forEach((element) => {
        const others = styles
            .filter((candidate) => elementOfStyle(candidate) === element)
            .flatMap((candidate) => classesOf(candidate.class));
        findTargets(state, element).forEach(({ pos, node }) => {
            const attributes = { ...getHtmlAttributes(node.attrs) };
            const classes = [
                ...classesOf(attributes.class).filter((name) => !others.includes(name)),
                ...(style !== null ? classesOf(style.class) : []),
            ];
            if (classes.length > 0) {
                attributes.class = classes.join(' ');
            } else {
                delete attributes.class;
            }
            tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                htmlAttributes: Object.keys(attributes).length > 0 ? attributes : null,
            });
        });
    });
    if (tr.docChanged) {
        editor.view.dispatch(tr);
    }
    editor.commands.focus();
}
