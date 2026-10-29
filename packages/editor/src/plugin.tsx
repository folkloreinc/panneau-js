import type { AnyExtension } from '@tiptap/core';

import type { FieldEntry, FieldEntryProps } from '@panneau/fields';

import { RichTextFieldEntry } from './RichTextField';
import type { RichTextButton } from './buttons';

export interface EditorPluginOptions {
    /**
     * TipTap extensions of the project, in every rich text field: custom nodes, such as an inline
     * logo. One with the name of a built-in extension (`link`) replaces it.
     */
    extensions?: readonly AnyExtension[];
    /** Toolbar buttons of the project, that the `toolbar` setting of fields names. */
    buttons?: readonly RichTextButton[];
}

/** The `richtext` field type as a `@panneau/core` plugin. */
export interface EditorPlugin {
    id: string;
    fields: Readonly<Record<string, FieldEntry>>;
}

/**
 * The `richtext` field type as a `@panneau/core` plugin, with the extensions and buttons of a
 * project: `createPanneauApp({ plugins: [fieldsPlugin, createEditorPlugin({ extensions })] })`.
 * A project gives all its extensions to one plugin: a later plugin replaces the field.
 */
export function createEditorPlugin({
    extensions,
    buttons,
}: EditorPluginOptions = {}): EditorPlugin {
    function RichTextFieldWithExtensions(props: FieldEntryProps) {
        return (
            <RichTextFieldEntry
                {...props}
                {...(extensions !== undefined ? { extensions } : {})}
                {...(buttons !== undefined ? { buttons } : {})}
            />
        );
    }
    return {
        id: 'panneau-editor',
        fields: {
            richtext:
                extensions === undefined && buttons === undefined
                    ? RichTextFieldEntry
                    : RichTextFieldWithExtensions,
        },
    };
}

/** The `richtext` field type as a `@panneau/core` plugin, without project extensions. */
export const editorPlugin: EditorPlugin = createEditorPlugin();
