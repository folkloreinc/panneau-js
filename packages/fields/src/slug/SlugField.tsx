import { WandSparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { FieldCheckResponse } from '@panneau/protocol';
import { Button, IconButton, usePanneauIntl } from '@panneau/ui';

import { useFieldsContext } from '../shared/context';
import { getFieldProps, getSetting, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps } from '../shared/types';
import { TextField, type TextFieldProps } from '../text/TextField';
import styles from './SlugField.module.css';

// Read outside the component: the React Compiler takes any `use…` name for a hook.
const suggestionMessage = messages.useSuggestion;

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

/** Checks a slug with the backend: whether it is available, and its URL. */
export type SlugCheck = (
    value: string,
    options: { signal: AbortSignal },
) => Promise<FieldCheckResponse>;

export interface SlugFieldProps extends Omit<TextFieldProps, 'type' | 'suffix'> {
    /**
     * The text the slug is made from (a title). While the slug is empty or still matches it, the
     * slug follows it.
     */
    source?: string | null;
    /** Name of the source, for the button that generates the slug from it. */
    sourceLabel?: string;
    /**
     * Checks the slug as it is typed, and once when the field shows: the field then shows the
     * URL the backend gives, and says when the slug is taken, with a free one to use instead.
     */
    onCheck?: SlugCheck | null;
    /** How long typing must pause before a check, in milliseconds. Defaults to 300. */
    checkDelay?: number;
    /**
     * What the check depends on besides the slug, such as the form's values: the slug is checked
     * again when it changes. `onCheck` itself can change on every render.
     */
    checkKey?: string;
}

/**
 * Checks a slug after a pause in typing, and keeps the latest answer for it. A check that
 * fails leaves the field as it is: saving still validates the slug.
 */
function useSlugCheck(
    value: string,
    onCheck: SlugCheck | null | undefined,
    delay: number,
    key: string,
): FieldCheckResponse | null {
    const [result, setResult] = useState<{ value: string; check: FieldCheckResponse } | null>(null);
    const latest = useRef(onCheck);
    useEffect(() => {
        latest.current = onCheck;
    });
    const enabled = onCheck !== null && onCheck !== undefined;
    useEffect(() => {
        if (!enabled || value === '') {
            return undefined;
        }
        const controller = new AbortController();
        const timer = setTimeout(() => {
            const check = latest.current;
            if (check === null || check === undefined) {
                return;
            }
            check(value, { signal: controller.signal })
                .then((check) => {
                    if (!controller.signal.aborted) {
                        setResult({ value, check });
                    }
                })
                .catch(() => undefined);
        }, delay);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [value, enabled, delay, key]);
    return result !== null && result.value === value ? result.check : null;
}

/**
 * A slug for URLs. Typed text is cleaned up on blur. With a `source`, the slug follows it until
 * it is edited, and a button generates it again. With `onCheck`, the backend says whether the
 * slug is taken, and gives its URL.
 */
export function SlugField({
    value,
    onChange,
    onBlur,
    source,
    sourceLabel,
    onCheck,
    checkDelay = 300,
    checkKey = '',
    disabled,
    readOnly,
    prefix,
    errors,
    description,
    ...props
}: SlugFieldProps) {
    const intl = usePanneauIntl();
    const previousSource = useRef(source);
    const check = useSlugCheck(value ?? '', onCheck, checkDelay, checkKey);
    const disabledByBackend = check?.disabled === true;
    const editable = disabled !== true && readOnly !== true && !disabledByBackend;

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
    const taken = check !== null && !check.available;
    const suggestion = taken && isString(check.suggestion) ? check.suggestion : null;
    const url = check !== null && isString(check.url) && !taken ? check.url : null;
    return (
        <TextField
            autoComplete="off"
            {...props}
            value={value}
            onChange={onChange}
            disabled={disabled}
            readOnly={readOnly === true || disabledByBackend}
            {...(check !== null && isString(check.prefix)
                ? { prefix: check.prefix }
                : prefix !== undefined
                  ? { prefix }
                  : {})}
            {...(errors !== undefined ? { errors } : {})}
            description={
                taken || url !== null || description !== undefined ? (
                    <span className={styles.description}>
                        {description !== undefined ? <span>{description}</span> : null}
                        {url !== null ? (
                            <a href={url} target="_blank" rel="noreferrer" className={styles.url}>
                                {url}
                            </a>
                        ) : null}
                        {taken ? (
                            <span className={styles.taken} role="status">
                                {intl.formatMessage(messages.slugTaken)}
                                {suggestion !== null && editable ? (
                                    <Button
                                        size="sm"
                                        appearance="ghost"
                                        onPress={() => onChange?.(suggestion)}
                                    >
                                        {intl.formatMessage(suggestionMessage, {
                                            suggestion,
                                        })}
                                    </Button>
                                ) : null}
                            </span>
                        ) : null}
                    </span>
                ) : undefined
            }
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

/**
 * The text of a source value: the value itself, or for a localized value, its value in `locale`.
 * Without a locale, the first locale that has a value.
 */
export function sourceText(value: unknown, locale?: string): string | null {
    if (typeof value === 'string') {
        return value;
    }
    if (value !== null && typeof value === 'object') {
        const record = value as Record<string, unknown>;
        if (locale !== undefined) {
            const text = record[locale];
            return isString(text) ? text : null;
        }
        return Object.values(record).find(isString) ?? null;
    }
    return null;
}

/** The form's values that a check depends on: all but the slug itself. */
function checkKeyOf(values: Record<string, unknown> | null, name: string): string {
    if (values === null) {
        return '';
    }
    const { [name]: _slug, ...others } = values;
    try {
        return JSON.stringify(others);
    } catch {
        return '';
    }
}

/**
 * The `slug` type: `from` names the field it follows, in the slug's own locale, or in the default
 * locale (the first of the fields context) for a slug that isn't localized. Setting `prefix`
 * shows a URL prefix. With `check`, the fields context's check source checks the slug of a field
 * at the top of the resource, with the form's values.
 */
export function SlugFieldEntry(props: FieldEntryProps) {
    const { field, parentValue, locale, path } = props;
    const { locales, checkSource } = useFieldsContext();
    const prefix = getSetting(field, 'prefix', isString);
    const values =
        parentValue !== null && typeof parentValue === 'object'
            ? (parentValue as Record<string, unknown>)
            : null;
    const source =
        field.from !== undefined && values !== null
            ? sourceText(values[field.from], locale ?? locales[0])
            : undefined;
    const topLevel = path === field.name || path === `${field.name}.${locale ?? ''}`;
    const onCheck: SlugCheck | null =
        field.check === true && checkSource !== null && topLevel
            ? (value, { signal }) =>
                  checkSource.check(
                      field.name,
                      {
                          value,
                          ...(locale !== undefined ? { locale } : {}),
                          values: values ?? {},
                      },
                      { signal },
                  )
            : null;
    return (
        <SlugField
            {...getFieldProps(props)}
            value={isString(props.value) ? props.value : null}
            onChange={props.onChange}
            onCheck={onCheck}
            checkKey={onCheck !== null ? checkKeyOf(values, field.name) : ''}
            {...(source !== undefined ? { source, sourceLabel: field.from ?? '' } : {})}
            {...(prefix !== undefined ? { prefix } : {})}
        />
    );
}
