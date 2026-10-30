import type { Editor } from '@tiptap/core';
import {
    Bold,
    Code,
    Italic,
    List,
    ListOrdered,
    Minus,
    Redo2,
    RemoveFormatting,
    Strikethrough,
    Subscript,
    Superscript,
    TextQuote,
    Underline,
    Undo2,
} from 'lucide-react';
import type { MessageDescriptor } from 'react-intl';

import { editorMessages as messages } from '@panneau/intl';
import type { IconComponent } from '@panneau/ui';

/**
 * A button of the toolbar. Plugins add their own (an inline logo), which the `toolbar` setting
 * names like the built-in ones.
 */
export interface RichTextButton {
    /** Its name in the `toolbar` setting: `logo`. */
    name: string;
    /** Its accessible label, also shown as a tooltip. */
    label: string | MessageDescriptor;
    icon: IconComponent;
    /** Runs its command on the editor. */
    run: (editor: Editor) => void;
    /** Makes it a toggle, pressed when the selection has what it adds. */
    isActive?: (editor: Editor) => boolean;
    /** Whether it can't run on the selection. Defaults to never. */
    isDisabled?: (editor: Editor) => boolean;
}

/** The buttons of the field's own marks and blocks, by name. */
export const builtInButtons: readonly RichTextButton[] = [
    {
        name: 'bold',
        label: messages.bold,
        icon: Bold,
        run: (editor) => editor.chain().focus().toggleBold().run(),
        isActive: (editor) => editor.isActive('bold'),
        isDisabled: (editor) => !editor.can().toggleBold(),
    },
    {
        name: 'italic',
        label: messages.italic,
        icon: Italic,
        run: (editor) => editor.chain().focus().toggleItalic().run(),
        isActive: (editor) => editor.isActive('italic'),
        isDisabled: (editor) => !editor.can().toggleItalic(),
    },
    {
        name: 'underline',
        label: messages.underline,
        icon: Underline,
        run: (editor) => editor.chain().focus().toggleUnderline().run(),
        isActive: (editor) => editor.isActive('underline'),
        isDisabled: (editor) => !editor.can().toggleUnderline(),
    },
    {
        name: 'strike',
        label: messages.strike,
        icon: Strikethrough,
        run: (editor) => editor.chain().focus().toggleStrike().run(),
        isActive: (editor) => editor.isActive('strike'),
        isDisabled: (editor) => !editor.can().toggleStrike(),
    },
    {
        name: 'superscript',
        label: messages.superscript,
        icon: Superscript,
        run: (editor) => editor.chain().focus().toggleSuperscript().run(),
        isActive: (editor) => editor.isActive('superscript'),
        isDisabled: (editor) => !editor.can().toggleSuperscript(),
    },
    {
        name: 'subscript',
        label: messages.subscript,
        icon: Subscript,
        run: (editor) => editor.chain().focus().toggleSubscript().run(),
        isActive: (editor) => editor.isActive('subscript'),
        isDisabled: (editor) => !editor.can().toggleSubscript(),
    },
    {
        name: 'code',
        label: messages.code,
        icon: Code,
        run: (editor) => editor.chain().focus().toggleCode().run(),
        isActive: (editor) => editor.isActive('code'),
        isDisabled: (editor) => !editor.can().toggleCode(),
    },
    {
        name: 'bulletList',
        label: messages.bulletList,
        icon: List,
        run: (editor) => editor.chain().focus().toggleBulletList().run(),
        isActive: (editor) => editor.isActive('bulletList'),
        isDisabled: (editor) => !editor.can().toggleBulletList(),
    },
    {
        name: 'orderedList',
        label: messages.orderedList,
        icon: ListOrdered,
        run: (editor) => editor.chain().focus().toggleOrderedList().run(),
        isActive: (editor) => editor.isActive('orderedList'),
        isDisabled: (editor) => !editor.can().toggleOrderedList(),
    },
    {
        name: 'blockquote',
        label: messages.blockquote,
        icon: TextQuote,
        run: (editor) => editor.chain().focus().toggleBlockquote().run(),
        isActive: (editor) => editor.isActive('blockquote'),
        isDisabled: (editor) => !editor.can().toggleBlockquote(),
    },
    {
        name: 'horizontalRule',
        label: messages.horizontalRule,
        icon: Minus,
        run: (editor) => editor.chain().focus().setHorizontalRule().run(),
        isDisabled: (editor) => !editor.can().setHorizontalRule(),
    },
    {
        name: 'clear',
        label: messages.clear,
        icon: RemoveFormatting,
        run: (editor) => editor.chain().focus().unsetAllMarks().run(),
    },
    {
        name: 'undo',
        label: messages.undo,
        icon: Undo2,
        run: (editor) => editor.chain().focus().undo().run(),
        isDisabled: (editor) => !editor.can().undo(),
    },
    {
        name: 'redo',
        label: messages.redo,
        icon: Redo2,
        run: (editor) => editor.chain().focus().redo().run(),
        isDisabled: (editor) => !editor.can().redo(),
    },
];
