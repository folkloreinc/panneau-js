import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { Link } from 'lucide-react';
import { useState } from 'react';
import {
    Button as AriaButton,
    Toolbar as AriaToolbar,
    Separator,
    ToggleButton,
} from 'react-aria-components';

import { editorMessages as messages } from '@panneau/intl';
import type { RichTextStyle } from '@panneau/protocol';
import { type IconComponent, Select, Tooltip, usePanneauIntl } from '@panneau/ui';

import { LinkDialog } from './LinkDialog';
import styles from './RichTextField.module.css';
import { type RichTextButton, builtInButtons } from './buttons';
import type { NewTabLinks } from './settings';
import { applyStyle, canApplyStyle, getActiveStyle } from './styles';

export interface ToolbarProps {
    editor: Editor;
    /** The items, in order: built-in names, names of `buttons`, and `|` between groups. */
    items: readonly string[];
    headings: readonly number[];
    styles: readonly RichTextStyle[];
    newTab: NewTabLinks;
    /** Buttons of plugins. One with the name of a built-in button replaces it. */
    buttons: readonly RichTextButton[];
}

const SEPARATOR = '|';
const NO_STYLE = 'none';

/** The items that show: known ones, without separators at the ends or next to each other. */
function getShownItems(
    items: readonly string[],
    known: (name: string) => boolean,
): readonly string[] {
    const shown = items.reduce<string[]>((result, name) => {
        if (name === SEPARATOR ? result.length > 0 && result.at(-1) !== SEPARATOR : known(name)) {
            result.push(name);
        }
        return result;
    }, []);
    return shown.at(-1) === SEPARATOR ? shown.slice(0, -1) : shown;
}

/** The block of the selection, as the text style select names it: `paragraph`, `h2`. */
function getTextStyle(editor: Editor): string | null {
    const { $from } = editor.state.selection;
    const block = $from.parent;
    if (block.type.name === 'heading') {
        return `h${String(block.attrs.level)}`;
    }
    return block.type.name === 'paragraph' ? 'paragraph' : null;
}

function ToolbarButton({
    label,
    icon: Icon,
    isActive,
    isDisabled,
    onPress,
}: {
    label: string;
    icon: IconComponent;
    isActive: boolean | undefined;
    isDisabled: boolean;
    onPress: () => void;
}) {
    const icon = <Icon size={16} aria-hidden />;
    return (
        <Tooltip content={label}>
            {isActive !== undefined ? (
                <ToggleButton
                    className={styles.button}
                    aria-label={label}
                    isSelected={isActive}
                    isDisabled={isDisabled}
                    onChange={onPress}
                >
                    {icon}
                </ToggleButton>
            ) : (
                <AriaButton
                    className={styles.button}
                    aria-label={label}
                    isDisabled={isDisabled}
                    onPress={onPress}
                >
                    {icon}
                </AriaButton>
            )}
        </Tooltip>
    );
}

/**
 * The toolbar of the rich text field: the text style (paragraph or a heading level), the block
 * styles, marks, links, lists and the buttons of plugins, as the field's `toolbar` lists them.
 */
export function Toolbar({
    editor,
    items,
    headings,
    styles: blockStyles,
    newTab,
    buttons,
}: ToolbarProps) {
    const intl = usePanneauIntl();
    const [linkOpen, setLinkOpen] = useState(false);
    const allButtons = new Map(
        [...builtInButtons, ...buttons].map((button) => [button.name, button]),
    );
    const known = (name: string) =>
        allButtons.has(name) ||
        name === 'heading' ||
        name === 'link' ||
        (name === 'style' && blockStyles.length > 0);
    const shown = getShownItems(items, known);

    // Only what the toolbar shows: it renders again when it changes
    const state = useEditorState({
        editor,
        selector: ({ editor: current }) => ({
            buttons: Object.fromEntries(
                shown.flatMap((name) => {
                    const button = allButtons.get(name);
                    return button !== undefined
                        ? [
                              [
                                  name,
                                  {
                                      active: button.isActive?.(current),
                                      disabled: button.isDisabled?.(current) ?? false,
                                  },
                              ],
                          ]
                        : [];
                }),
            ),
            textStyle: getTextStyle(current),
            canSetTextStyle: current.can().setParagraph(),
            style: (() => {
                const active = getActiveStyle(current.state, blockStyles);
                return active !== null ? blockStyles.indexOf(active) : -1;
            })(),
            applicable: blockStyles.map((style) => canApplyStyle(current.state, style)),
            link: current.isActive('link'),
            canLink: current.can().setLink({ href: '' }),
        }),
    });

    const textStyle = state.textStyle;
    const levels =
        textStyle !== null && textStyle !== 'paragraph' && !headings.includes(Number(textStyle[1]))
            ? [...headings, Number(textStyle[1])]
            : headings;

    return (
        <>
            <AriaToolbar
                aria-label={intl.formatMessage(messages.toolbar)}
                className={styles.toolbar}
            >
                {shown.map((name, index) => {
                    const key = `${name}-${String(index)}`;
                    if (name === SEPARATOR) {
                        return (
                            <Separator
                                key={key}
                                orientation="vertical"
                                className={styles.separator}
                            />
                        );
                    }
                    if (name === 'heading') {
                        return (
                            <Select
                                key={key}
                                aria-label={intl.formatMessage(messages.textStyle)}
                                className={styles.select}
                                isDisabled={!state.canSetTextStyle}
                                options={[
                                    {
                                        value: 'paragraph',
                                        label: intl.formatMessage(messages.paragraph),
                                    },
                                    ...levels.map((level) => ({
                                        value: `h${String(level)}`,
                                        label: intl.formatMessage(messages.heading, { level }),
                                    })),
                                ]}
                                value={textStyle}
                                onChange={(value) => {
                                    if (value === 'paragraph') {
                                        editor.chain().focus().setParagraph().run();
                                    } else if (typeof value === 'string') {
                                        const level = Number(value.slice(1));
                                        if (level >= 1 && level <= 6) {
                                            editor
                                                .chain()
                                                .focus()
                                                .setHeading({
                                                    level: level as 1 | 2 | 3 | 4 | 5 | 6,
                                                })
                                                .run();
                                        }
                                    }
                                }}
                            />
                        );
                    }
                    if (name === 'style') {
                        const active = state.style;
                        return (
                            <Select
                                key={key}
                                aria-label={intl.formatMessage(messages.blockStyle)}
                                className={styles.select}
                                options={[
                                    {
                                        value: NO_STYLE,
                                        label: intl.formatMessage(messages.noStyle),
                                    },
                                    ...blockStyles.map((style, styleIndex) => ({
                                        value: String(styleIndex),
                                        label: style.label,
                                        disabled: state.applicable[styleIndex] !== true,
                                    })),
                                ]}
                                value={active >= 0 ? String(active) : NO_STYLE}
                                onChange={(value) => {
                                    const style =
                                        value === NO_STYLE ? null : blockStyles[Number(value)];
                                    applyStyle(editor, style ?? null, blockStyles);
                                }}
                            />
                        );
                    }
                    if (name === 'link') {
                        return (
                            <ToolbarButton
                                key={key}
                                label={intl.formatMessage(messages.link)}
                                icon={Link}
                                isActive={state.link}
                                isDisabled={!state.canLink}
                                onPress={() => setLinkOpen(true)}
                            />
                        );
                    }
                    const button = allButtons.get(name);
                    if (button === undefined) {
                        return null;
                    }
                    const buttonState = state.buttons[name];
                    return (
                        <ToolbarButton
                            key={key}
                            label={
                                typeof button.label === 'string'
                                    ? button.label
                                    : intl.formatMessage(button.label)
                            }
                            icon={button.icon}
                            isActive={buttonState?.active}
                            isDisabled={buttonState?.disabled === true}
                            onPress={() => button.run(editor)}
                        />
                    );
                })}
            </AriaToolbar>
            {shown.includes('link') ? (
                <LinkDialog
                    editor={editor}
                    newTab={newTab}
                    isOpen={linkOpen}
                    onOpenChange={setLinkOpen}
                />
            ) : null}
        </>
    );
}
