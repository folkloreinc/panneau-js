import { ExternalLink } from 'lucide-react';

import { Icon, usePanneauIntl } from '@panneau/ui';

import { getFieldProps, getSetting, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps } from '../shared/types';
import { TextField, type TextFieldProps } from '../text/TextField';
import styles from './UrlField.module.css';

export interface UrlFieldProps extends Omit<TextFieldProps, 'type' | 'inputMode' | 'suffix'> {
    /** Scheme added on blur to a URL without one (`example.com`). Defaults to `https://`. */
    defaultScheme?: string;
}

const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/** Adds a scheme to a URL that has none, and isn't a path or an anchor. */
export function withScheme(url: string, scheme = 'https://'): string {
    const trimmed = url.trim();
    if (trimmed.startsWith('//')) {
        return `${scheme}${trimmed.slice(2)}`;
    }
    if (trimmed === '' || SCHEME.test(trimmed) || /^[/#?]/.test(trimmed)) {
        return trimmed;
    }
    return `${scheme}${trimmed}`;
}

/**
 * A URL, with the URL keyboard on phones and a link to open it. A URL typed without a scheme
 * gets `https://` on blur, as v4 did.
 */
export function UrlField({
    value,
    onChange,
    onBlur,
    defaultScheme = 'https://',
    ...props
}: UrlFieldProps) {
    const intl = usePanneauIntl();
    const openable = value !== null && value !== undefined && /^https?:\/\//i.test(value);
    return (
        <TextField
            autoComplete="off"
            {...props}
            type="url"
            inputMode="url"
            value={value}
            onChange={onChange}
            onBlur={() => {
                if (value !== null && value !== undefined) {
                    const next = withScheme(value, defaultScheme);
                    if (next !== value) {
                        onChange?.(next === '' ? null : next);
                    }
                }
                onBlur?.();
            }}
            suffix={
                openable ? (
                    <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.open}
                        title={intl.formatMessage(messages.openLink)}
                    >
                        <Icon icon={ExternalLink} label={intl.formatMessage(messages.openLink)} />
                    </a>
                ) : undefined
            }
        />
    );
}

/** The `url` type: setting `defaultScheme`. */
export function UrlFieldEntry(props: FieldEntryProps) {
    const defaultScheme = getSetting(props.field, 'defaultScheme', isString);
    return (
        <UrlField
            {...getFieldProps(props)}
            value={isString(props.value) ? props.value : null}
            onChange={props.onChange}
            {...(defaultScheme !== undefined ? { defaultScheme } : {})}
        />
    );
}
