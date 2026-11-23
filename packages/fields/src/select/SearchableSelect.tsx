import { useState } from 'react';

import { uiMessages } from '@panneau/intl';
import type { Option } from '@panneau/protocol';
import { ComboBox, type OptionValue, usePanneauIntl } from '@panneau/ui';

import { messages } from '../shared/messages';
import type { FieldProps } from '../shared/types';

/** Selects with more options than this are searchable, unless their field says otherwise. */
export const SELECT_SEARCH_THRESHOLD = 10;

export interface SearchableSelectProps extends Omit<FieldProps<never>, 'value' | 'onChange'> {
    options: readonly Option[];
    value: OptionValue | null;
    onChange: (value: OptionValue | null) => void;
    placeholder?: string | undefined;
    controlClassName?: string | undefined;
}

/** Lower case, without accents: `Québec` matches `quebec`. */
function normalize(text: string): string {
    return text
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();
}

/** Whether a word of the label, or the label itself, starts with the query. */
function matches(option: Option, query: string): boolean {
    const text = normalize(query.trim());
    if (text === '') {
        return true;
    }
    const label = normalize(option.label);
    return (
        label.startsWith(text) || label.split(/[\s'’()/-]+/).some((word) => word.startsWith(text))
    );
}

/**
 * A single select whose options are filtered as the user types: a combo box with the value of the
 * select (strings, numbers or booleans). Clearing the text clears the value.
 */
export function SearchableSelect({
    options,
    value,
    onChange,
    onBlur,
    label,
    description,
    errors,
    disabled,
    readOnly,
    required,
    placeholder,
    name,
    id,
    autoFocus,
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    controlClassName,
    ...props
}: SearchableSelectProps) {
    const intl = usePanneauIntl();
    // The text being typed, while the user searches; the label of the value otherwise.
    const [query, setQuery] = useState<string | null>(null);
    const index = value !== null ? options.findIndex((option) => option.value === value) : -1;
    const selected = options[index];
    const items = options
        .map((option, position) => ({ option, id: String(position) }))
        .filter(({ option }) => query === null || matches(option, query))
        .map(({ option, id: key }) => ({
            id: key,
            label: option.label,
            ...(option.description !== undefined ? { description: option.description } : {}),
            ...(option.disabled !== undefined ? { disabled: option.disabled } : {}),
        }));
    return (
        <ComboBox
            label={label}
            description={description}
            errors={errors ?? []}
            isRequired={required}
            isDisabled={disabled}
            isReadOnly={readOnly}
            autoFocus={autoFocus}
            className={className}
            labelClassName={labelClassName}
            descriptionClassName={descriptionClassName}
            errorsClassName={errorsClassName}
            {...(controlClassName !== undefined ? { controlClassName } : {})}
            {...(props['aria-label'] !== undefined ? { 'aria-label': props['aria-label'] } : {})}
            {...(name !== undefined ? { name } : {})}
            {...(id !== undefined ? { id } : {})}
            items={items}
            value={index === -1 ? null : String(index)}
            inputValue={query ?? selected?.label ?? ''}
            onInputChange={(text) => {
                setQuery(text);
                if (text === '' && selected !== undefined) {
                    onChange(null);
                }
            }}
            onChange={(key) => {
                setQuery(null);
                const next = key !== null ? options[Number(key)] : undefined;
                if (next !== undefined && next.value !== value) {
                    onChange(next.value);
                }
            }}
            onBlur={() => {
                setQuery(null);
                onBlur?.();
            }}
            // Closed, it reads as a select: "Select…" without a value
            placeholder={placeholder ?? intl.formatMessage(uiMessages.selectPlaceholder)}
            emptyMessage={intl.formatMessage(messages.noResults)}
        />
    );
}
