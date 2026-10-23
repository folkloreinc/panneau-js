import { X } from 'lucide-react';
import { type ClipboardEvent, type KeyboardEvent, useId, useState } from 'react';
import { Button, Tag, TagGroup, TagList } from 'react-aria-components';

import { type FieldChromeProps, fieldStyles } from '../field/FieldParts';
import { Icon } from '../icon/Icon';
import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { cx } from '../utils/cx';
import styles from './TagsInput.module.css';

/** A suggested tag: its value, and the label shown for it. */
export interface TagSuggestion {
    value: string;
    label?: string;
}

export interface TagsInputProps extends FieldChromeProps {
    /** The tags, or `null` when there are none. */
    value?: readonly string[] | null;
    /** Called with the tags, or `null` when the last one is removed. */
    onChange?: (value: string[] | null) => void;
    onBlur?: () => void;
    /** Tags offered as the user types. */
    suggestions?: readonly TagSuggestion[];
    /** Whether tags outside the suggestions are allowed. Defaults to true. */
    allowCustom?: boolean;
    placeholder?: string;
    name?: string;
    isRequired?: boolean;
    isDisabled?: boolean;
    isReadOnly?: boolean;
    autoFocus?: boolean;
    controlClassName?: string;
}

/**
 * A list of words. Enter, Tab or a comma adds what is typed, Backspace in the empty input removes
 * the last tag, and pasting a list separated by commas or lines adds each one. Tags are trimmed,
 * and a tag already in the list isn't added again. Suggestions complete what is typed; without
 * `allowCustom`, only they can be added.
 */
export function TagsInput({
    label,
    description,
    errors = [],
    value,
    onChange,
    onBlur,
    suggestions = [],
    allowCustom = true,
    placeholder,
    name,
    isRequired,
    isDisabled,
    isReadOnly,
    autoFocus,
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    controlClassName,
}: TagsInputProps) {
    const intl = usePanneauIntl();
    const id = useId();
    const [draft, setDraft] = useState('');
    const tags = value ?? [];
    const invalid = errors.length > 0;
    const editable = isDisabled !== true && isReadOnly !== true;
    const labelOf = (tag: string) =>
        suggestions.find((suggestion) => suggestion.value === tag)?.label ?? tag;

    /** The tag a text adds: the suggestion it names, or the text itself when allowed. */
    const resolve = (text: string): string | null => {
        const trimmed = text.trim();
        if (trimmed === '') {
            return null;
        }
        const lower = trimmed.toLocaleLowerCase();
        const suggestion = suggestions.find(
            (candidate) =>
                candidate.value.toLocaleLowerCase() === lower ||
                (candidate.label ?? '').toLocaleLowerCase() === lower,
        );
        if (suggestion !== undefined) {
            return suggestion.value;
        }
        return allowCustom ? trimmed : null;
    };

    const add = (texts: readonly string[]) => {
        const next = [...tags];
        texts.forEach((text) => {
            const tag = resolve(text);
            if (tag !== null && !next.includes(tag)) {
                next.push(tag);
            }
        });
        if (next.length !== tags.length) {
            onChange?.(next);
        }
    };

    const remove = (removed: ReadonlySet<string | number>) => {
        const next = tags.filter((tag) => !removed.has(tag));
        onChange?.(next.length > 0 ? next : null);
    };

    const commit = () => {
        if (draft.trim() !== '') {
            add([draft]);
            setDraft('');
        }
    };

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === ',' || (event.key === 'Tab' && draft !== '')) {
            if (draft.trim() !== '') {
                event.preventDefault();
                commit();
            } else if (event.key !== 'Tab') {
                event.preventDefault();
            }
        } else if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
            event.preventDefault();
            remove(new Set([tags[tags.length - 1] as string]));
        }
    };

    const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
        const text = event.clipboardData.getData('text');
        if (/[,\n]/.test(text)) {
            event.preventDefault();
            add(text.split(/[,\n]/));
        }
    };

    const describedBy = [
        description !== undefined && description !== null ? `${id}-description` : null,
        invalid ? `${id}-errors` : null,
    ]
        .filter((part) => part !== null)
        .join(' ');

    return (
        <div className={cx('panneau-tags-input', fieldStyles.field, className)}>
            {label !== undefined && label !== null ? (
                <label htmlFor={`${id}-input`} className={cx(fieldStyles.label, labelClassName)}>
                    {label}
                    {isRequired === true ? (
                        <span className={fieldStyles.required} aria-hidden="true">
                            *
                        </span>
                    ) : null}
                </label>
            ) : null}
            <div
                className={cx(fieldStyles.control, styles.control, controlClassName)}
                data-invalid={invalid || undefined}
                data-disabled={isDisabled || undefined}
                data-readonly={isReadOnly || undefined}
            >
                {tags.length > 0 ? (
                    <TagGroup
                        aria-label={intl.formatMessage(messages.tags, {
                            label: typeof label === 'string' ? label : '',
                        })}
                        onRemove={editable ? remove : undefined}
                        className={styles.group}
                    >
                        <TagList className={styles.list}>
                            {tags.map((tag) => (
                                <Tag
                                    key={tag}
                                    id={tag}
                                    textValue={labelOf(tag)}
                                    className={styles.tag}
                                >
                                    {labelOf(tag)}
                                    {editable ? (
                                        <Button slot="remove" className={styles.remove}>
                                            <Icon icon={X} size="xs" />
                                        </Button>
                                    ) : null}
                                </Tag>
                            ))}
                        </TagList>
                    </TagGroup>
                ) : null}
                {editable ? (
                    <input
                        id={`${id}-input`}
                        className={cx(fieldStyles.bare, styles.input)}
                        value={draft}
                        placeholder={tags.length === 0 ? placeholder : undefined}
                        list={suggestions.length > 0 ? `${id}-suggestions` : undefined}
                        autoComplete="off"
                        autoFocus={autoFocus}
                        aria-invalid={invalid || undefined}
                        aria-required={isRequired || undefined}
                        aria-describedby={describedBy !== '' ? describedBy : undefined}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={onKeyDown}
                        onPaste={onPaste}
                        onBlur={() => {
                            commit();
                            onBlur?.();
                        }}
                    />
                ) : null}
                {suggestions.length > 0 ? (
                    <datalist id={`${id}-suggestions`}>
                        {suggestions
                            .filter((suggestion) => !tags.includes(suggestion.value))
                            .map((suggestion) => (
                                <option
                                    key={suggestion.value}
                                    value={suggestion.label ?? suggestion.value}
                                />
                            ))}
                    </datalist>
                ) : null}
            </div>
            {name !== undefined
                ? tags.map((tag) => (
                      <input key={tag} type="hidden" name={`${name}[]`} value={tag} />
                  ))
                : null}
            {description !== undefined && description !== null ? (
                <div
                    id={`${id}-description`}
                    className={cx(fieldStyles.description, descriptionClassName)}
                >
                    {description}
                </div>
            ) : null}
            {invalid ? (
                <div id={`${id}-errors`} className={cx(fieldStyles.errors, errorsClassName)}>
                    {errors.map((error, index) => (
                        <span key={index} className={fieldStyles.error}>
                            {error}
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
