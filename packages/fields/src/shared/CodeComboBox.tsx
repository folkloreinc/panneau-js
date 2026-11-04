import { type ReactNode, useState } from 'react';

import { ComboBox } from '@panneau/ui';

import type { FieldProps } from './types';

/** A choice of a code combo box: a code, its name, and a decorative prefix (a flag). */
export interface CodeChoice {
    code: string;
    name: string;
    prefix?: ReactNode;
}

export interface CodeComboBoxProps extends Omit<FieldProps<string>, 'onChange'> {
    choices: readonly CodeChoice[];
    onChange?: ((value: string | null) => void) | undefined;
    placeholder?: string | undefined;
    emptyMessage: string;
    controlClassName?: string | undefined;
}

/** Lower case, without accents: `Québec` matches `quebec`. */
function normalize(text: string): string {
    return text
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase();
}

function matches(choice: CodeChoice, query: string): boolean {
    const text = normalize(query.trim());
    if (text === '') {
        return true;
    }
    return (
        normalize(choice.name)
            .split(/[\s'’-]+/)
            .some((word) => word.startsWith(text)) ||
        normalize(choice.name).startsWith(text) ||
        choice.code.toLowerCase() === text
    );
}

/**
 * A combo box of codes shown by their names (countries, regions): typing filters them by the start
 * of a word of their name, or by their code. A value outside the choices shows as it is.
 */
export function CodeComboBox({
    choices,
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
    emptyMessage,
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    controlClassName,
    ...props
}: CodeComboBoxProps) {
    // The text being typed, while the user searches; the name of the value otherwise.
    const [query, setQuery] = useState<string | null>(null);
    const current = value !== null && value !== undefined && value !== '' ? value : null;
    const selected = current !== null ? choices.find((choice) => choice.code === current) : null;
    const items = (query !== null ? choices.filter((choice) => matches(choice, query)) : choices)
        .concat(
            // A value outside the choices, kept from before, stays selectable as it is.
            current !== null && selected === undefined && query === null
                ? [{ code: current, name: current }]
                : [],
        )
        .map((choice): { id: string; label: string; prefix?: ReactNode } => ({
            id: choice.code,
            label: choice.name,
            ...(choice.prefix !== undefined ? { prefix: choice.prefix } : {}),
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
            value={current}
            prefix={query === null ? selected?.prefix : undefined}
            inputValue={query ?? selected?.name ?? current ?? ''}
            onInputChange={(text) => {
                setQuery(text);
                if (text === '' && current !== null) {
                    onChange?.(null);
                }
            }}
            onChange={(code) => {
                setQuery(null);
                if (code !== null && code !== current) {
                    onChange?.(code);
                }
            }}
            onBlur={() => {
                setQuery(null);
                onBlur?.();
            }}
            placeholder={placeholder}
            emptyMessage={emptyMessage}
        />
    );
}
