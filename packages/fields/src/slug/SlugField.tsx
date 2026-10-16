import { WandSparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { IconButton, usePanneauIntl } from '@panneau/ui';

import { getFieldProps, getSetting, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps } from '../shared/types';
import { TextField, type TextFieldProps } from '../text/TextField';

/**
 * Turns a text into a slug: lowercase ASCII letters and digits separated by dashes, without
 * accents (`Été à Montréal` gives `ete-a-montreal`).
 */
export function slugify(text: string): string {
    return text
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export interface SlugFieldProps extends Omit<TextFieldProps, 'type' | 'suffix'> {
    /**
     * The text the slug is made from (a title). While the slug is empty or still matches it, the
     * slug follows it.
     */
    source?: string | null;
    /** Name of the source, for the button that generates the slug from it. */
    sourceLabel?: string;
}

/**
 * A slug for URLs. Typed text is cleaned up on blur. With a `source`, the slug follows it until
 * it is edited, and a button generates it again.
 */
export function SlugField({
    value,
    onChange,
    onBlur,
    source,
    sourceLabel,
    disabled,
    readOnly,
    ...props
}: SlugFieldProps) {
    const intl = usePanneauIntl();
    const previousSource = useRef(source);
    const editable = disabled !== true && readOnly !== true;

    useEffect(() => {
        const previous = previousSource.current;
        previousSource.current = source;
        if (!editable || source === previous || source === undefined) {
            return;
        }
        const current = value ?? '';
        if (current === '' || current === slugify(previous ?? '')) {
            const next = slugify(source ?? '');
            if (next !== current) {
                onChange?.(next === '' ? null : next);
            }
        }
    }, [source, value, onChange, editable]);

    const generated = slugify(source ?? '');
    return (
        <TextField
            autoComplete="off"
            {...props}
            value={value}
            onChange={onChange}
            disabled={disabled}
            readOnly={readOnly}
            onBlur={() => {
                if (value !== null && value !== undefined) {
                    const next = slugify(value);
                    if (next !== value) {
                        onChange?.(next === '' ? null : next);
                    }
                }
                onBlur?.();
            }}
            suffix={
                source !== undefined && editable ? (
                    <IconButton
                        icon={WandSparkles}
                        size="sm"
                        label={intl.formatMessage(messages.generateSlug, {
                            field: sourceLabel ?? '',
                        })}
                        isDisabled={generated === '' || generated === value}
                        onPress={() => onChange?.(generated === '' ? null : generated)}
                    />
                ) : undefined
            }
        />
    );
}

function sourceText(value: unknown): string | null {
    if (typeof value === 'string') {
        return value;
    }
    // A localized source: its first locale.
    if (value !== null && typeof value === 'object') {
        const first = Object.values(value as Record<string, unknown>).find(isString);
        return first ?? null;
    }
    return null;
}

/** The `slug` type: `from` names the field it follows, and setting `prefix` shows a URL prefix. */
export function SlugFieldEntry(props: FieldEntryProps) {
    const { field, parentValue } = props;
    const prefix = getSetting(field, 'prefix', isString);
    const source =
        field.from !== undefined && parentValue !== null && typeof parentValue === 'object'
            ? sourceText((parentValue as Record<string, unknown>)[field.from])
            : undefined;
    return (
        <SlugField
            {...getFieldProps(props)}
            value={isString(props.value) ? props.value : null}
            onChange={props.onChange}
            {...(source !== undefined ? { source, sourceLabel: field.from ?? '' } : {})}
            {...(prefix !== undefined ? { prefix } : {})}
        />
    );
}
