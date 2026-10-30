import { Node, mergeAttributes } from '@tiptap/core';
import { Sparkles } from 'lucide-react';

import type { RichTextButton } from '../buttons';

/** An inline logo, as a project adds it with a plugin: `<span class="logo" data-logo="">`. */
export const Logo = Node.create({
    name: 'logo',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,
    parseHTML: () => [{ tag: 'span[data-logo]' }],
    renderHTML: ({ HTMLAttributes }) => [
        'span',
        mergeAttributes(HTMLAttributes, { class: 'logo', 'data-logo': '', 'aria-label': 'Logo' }),
    ],
});

/** The button that inserts the logo, named `logo` in the `toolbar` setting. */
export const logoButton: RichTextButton = {
    name: 'logo',
    label: 'Logo',
    icon: Sparkles,
    run: (editor) => editor.chain().focus().insertContent({ type: 'logo' }).run(),
    isDisabled: (editor) => !editor.can().insertContent({ type: 'logo' }),
};
