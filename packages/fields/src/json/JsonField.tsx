import { useState } from 'react';

import { TextArea, usePanneauIntl } from '@panneau/ui';

import { getFieldProps, getSetting, isNumber } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import styles from './JsonField.module.css';

/** The value of a `json` field: an object or an array, or the text while it doesn't parse. */
export type JsonValue = Record<string, unknown> | unknown[] | string;

export interface JsonFieldProps extends FieldProps<JsonValue> {
    placeholder?: string;
    /** Visible lines. Defaults to 8. */
    rows?: number;
}

/** The text of a value: indented JSON, or the text that doesn't parse as it is. */
function toText(value: JsonValue | null | undefined): string {
    if (value === null || value === undefined) {
        return '';
    }
    return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

/** The value of a text: what it parses to when it is an object or an array, or the text itself. */
export function parseJson(text: string): { value: JsonValue | null; error: string | null } {
    if (text.trim() === '') {
        return { value: null, error: null };
    }
    try {
        const parsed: unknown = JSON.parse(text);
        if (parsed !== null && typeof parsed === 'object') {
            return { value: parsed as JsonValue, error: null };
        }
        return { value: text, error: 'an object or an array' };
    } catch (error) {
        return { value: text, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Structured data edited as JSON: an object or an array. While the text doesn't parse, the value
 * is the text itself, which the `json` rule refuses, so the form can't be saved with it. The text
 * is indented again on blur once it parses.
 */
export function JsonField({
    value,
    onChange,
    onBlur,
    errors = [],
    rows = 8,
    disabled,
    readOnly,
    required,
    ...props
}: JsonFieldProps) {
    const intl = usePanneauIntl();
    // The text as typed: a value that comes back from the form keeps its text, and a value set
    // from outside (a reset, a reload) shows its JSON
    const [state, setState] = useState(() => ({ value, text: toText(value) }));
    if (state.value !== value) {
        setState({ value, text: toText(value) });
    }
    const { text } = state;
    const { error } = parseJson(text);
    // The parser's message, until the form shows the rule's
    const shown =
        error !== null && errors.length === 0
            ? [intl.formatMessage(messages.jsonInvalid, { error })]
            : errors;
    return (
        <TextArea
            {...props}
            value={text}
            onChange={(next) => {
                const parsed = parseJson(next).value;
                setState({ value: parsed, text: next });
                onChange?.(parsed);
            }}
            onBlur={() => {
                // Indent the text once it parses
                if (value !== null && value !== undefined && typeof value !== 'string') {
                    setState({ value, text: toText(value) });
                }
                onBlur?.();
            }}
            errors={shown}
            rows={rows}
            spellCheck="false"
            textAreaClassName={styles.code}
            isDisabled={disabled}
            isReadOnly={readOnly}
            isRequired={required}
        />
    );
}

/** The `json` type: an object or an array, with setting `rows`. */
export function JsonFieldEntry(props: FieldEntryProps) {
    const rows = getSetting(props.field, 'rows', isNumber);
    const { value } = props;
    return (
        <JsonField
            {...getFieldProps(props)}
            value={
                typeof value === 'string' || (value !== null && typeof value === 'object')
                    ? (value as JsonValue)
                    : null
            }
            onChange={props.onChange}
            {...(rows !== undefined ? { rows } : {})}
        />
    );
}
