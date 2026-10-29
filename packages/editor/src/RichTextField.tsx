import { type AnyExtension, getSchema } from '@tiptap/core';
import { EditorContent, useEditor } from '@tiptap/react';
import { useEffect, useRef } from 'react';

import { type FieldEntryProps, type FieldProps, getFieldProps } from '@panneau/fields';
import { editorMessages as messages } from '@panneau/intl';
import type { RichTextStyle } from '@panneau/protocol';
import { Fieldset, usePanneauIntl } from '@panneau/ui';

import styles from './RichTextField.module.css';
import { Toolbar } from './Toolbar';
import type { RichTextButton } from './buttons';
import { createRichTextExtensions } from './extensions/index';
import { parseRichText, serializeRichText } from './html';
import {
    DEFAULT_HEADINGS,
    DEFAULT_TOOLBAR,
    type NewTabLinks,
    getRichTextOptions,
} from './settings';

export interface RichTextFieldProps extends FieldProps<string> {
    placeholder?: string;
    /**
     * The toolbar, in order: `heading`, `style`, `bold`, `italic`, `underline`, `strike`,
     * `superscript`, `subscript`, `code`, `link`, `bulletList`, `orderedList`, `blockquote`,
     * `horizontalRule`, `clear`, `undo`, `redo`, names of `buttons`, and `|` between groups.
     */
    toolbar?: readonly string[];
    /** The heading levels the toolbar offers. Defaults to 2, 3 and 4. */
    headings?: readonly number[];
    /** Block styles: a class on a paragraph, a heading, a quote or a list. */
    styles?: readonly RichTextStyle[];
    /** Which links open in a new tab: as the user chooses (the default), external ones, or none. */
    newTab?: NewTabLinks;
    /**
     * TipTap extensions of the project: custom nodes such as an inline logo. One with the name of
     * a built-in extension replaces it. The editor is made again when they change.
     */
    extensions?: readonly AnyExtension[];
    /** Toolbar buttons of the project, that `toolbar` names. */
    buttons?: readonly RichTextButton[];
    contentClassName?: string;
}

const NO_EXTENSIONS: readonly AnyExtension[] = [];
const NO_BUTTONS: readonly RichTextButton[] = [];
const NO_STYLES: readonly RichTextStyle[] = [];

/**
 * Rich text, stored as HTML (decision 0007): an empty text is `null`. Content keeps what the
 * toolbar doesn't offer (elements, attributes, embeds), and HTML written by another editor stays
 * as it was until the text is edited.
 */
export function RichTextField({
    value,
    onChange,
    onBlur,
    placeholder,
    toolbar = DEFAULT_TOOLBAR,
    headings = DEFAULT_HEADINGS,
    styles: blockStyles = NO_STYLES,
    newTab = 'choose',
    extensions: projectExtensions = NO_EXTENSIONS,
    buttons = NO_BUTTONS,
    label,
    description,
    errors = [],
    disabled = false,
    readOnly = false,
    required = false,
    name,
    id,
    autoFocus,
    'aria-label': ariaLabel,
    className,
    contentClassName,
}: RichTextFieldProps) {
    const intl = usePanneauIntl();
    const editable = !disabled && !readOnly;
    const extensions = createRichTextExtensions({
        extensions: projectExtensions,
        ...(placeholder !== undefined ? { placeholder } : {}),
        html: { label: intl.formatMessage(messages.html), className: styles.html ?? '' },
    });
    // The HTML of the editor's content: the value it was loaded from, or the last one it gave
    const current = useRef<string | null | undefined>(value);
    const accessibleName = ariaLabel ?? (typeof label === 'string' ? label : undefined);
    const invalid = errors.length > 0;
    const contentClass = [styles.content, contentClassName].filter(Boolean).join(' ');
    const getAttributes = (): Record<string, string> => ({
        role: 'textbox',
        'aria-multiline': 'true',
        class: contentClass,
        ...(accessibleName !== undefined ? { 'aria-label': accessibleName } : {}),
        ...(invalid ? { 'aria-invalid': 'true' } : {}),
        ...(required ? { 'aria-required': 'true' } : {}),
        ...(!editable ? { 'aria-readonly': 'true' } : {}),
        ...(id !== undefined ? { id } : {}),
    });

    const editor = useEditor(
        {
            extensions,
            content: parseRichText(value ?? null, getSchema(extensions)).toJSON() as Record<
                string,
                unknown
            >,
            editable,
            autofocus: autoFocus === true ? 'end' : false,
            immediatelyRender: true,
            shouldRerenderOnTransaction: false,
            editorProps: { attributes: getAttributes() },
            onUpdate: ({ editor: updated }) => {
                const html = serializeRichText(updated.state.doc, updated.schema);
                current.current = html;
                onChange?.(html);
            },
            onBlur: () => onBlur?.(),
        },
        // The schema only changes with the extensions of the project, and the placeholder
        [projectExtensions, placeholder],
    );

    // A value that comes from elsewhere (a reset, another user) replaces the content
    useEffect(() => {
        if (editor === null || value === current.current) {
            return;
        }
        current.current = value;
        editor.commands.setContent(parseRichText(value ?? null, editor.schema).toJSON(), {
            emitUpdate: false,
        });
    }, [editor, value]);

    useEffect(() => {
        editor?.setEditable(editable, false);
    }, [editor, editable]);

    useEffect(() => {
        editor?.setOptions({ editorProps: { attributes: getAttributes() } });
        // The attributes only change with these
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor, accessibleName, invalid, required, editable, id, contentClass]);

    return (
        <Fieldset
            legend={label}
            description={description}
            errors={errors}
            isRequired={required}
            isDisabled={disabled}
            className={[styles.field, className].filter(Boolean).join(' ')}
        >
            <div
                className={styles.editor}
                data-invalid={invalid ? true : undefined}
                data-disabled={disabled ? true : undefined}
                data-readonly={readOnly ? true : undefined}
            >
                {editor !== null && editable ? (
                    <Toolbar
                        editor={editor}
                        items={toolbar}
                        headings={headings}
                        styles={blockStyles}
                        newTab={newTab}
                        buttons={buttons}
                    />
                ) : null}
                <EditorContent editor={editor} />
            </div>
            {name !== undefined ? <input type="hidden" name={name} value={value ?? ''} /> : null}
        </Fieldset>
    );
}

/**
 * The `richtext` type: its toolbar, heading levels, block styles and links from `settings`
 * (`RichTextSettings`), and the extensions and buttons of the editor plugin.
 */
export function RichTextFieldEntry(
    props: FieldEntryProps & {
        extensions?: readonly AnyExtension[];
        buttons?: readonly RichTextButton[];
    },
) {
    const options = getRichTextOptions(props.field);
    return (
        <RichTextField
            {...getFieldProps(props)}
            value={typeof props.value === 'string' ? props.value : null}
            onChange={props.onChange}
            toolbar={options.toolbar}
            headings={options.headings}
            styles={options.styles}
            newTab={options.newTab}
            {...(props.extensions !== undefined ? { extensions: props.extensions } : {})}
            {...(props.buttons !== undefined ? { buttons: props.buttons } : {})}
        />
    );
}
