import { useEffect, useEffectEvent, useState } from 'react';

import type { EmbedValue } from '@panneau/protocol';
import { Spinner, TextInput, usePanneauIntl } from '@panneau/ui';

import { useFieldsContext } from '../shared/context';
import type { EmbedSource } from '../shared/embed';
import { getFieldProps, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import styles from './EmbedField.module.css';

export type { EmbedValue };

const RESOLVE_DELAY = 500;

export interface EmbedFieldProps extends FieldProps<EmbedValue> {
    placeholder?: string;
    /** Where the preview comes from. Defaults to that of the `FieldsProvider`. */
    embedSource?: EmbedSource | null;
}

/** Whether a value is an embed: an object with a `url`. */
export function isEmbed(value: unknown): value is EmbedValue {
    return (
        value !== null &&
        typeof value === 'object' &&
        isString((value as Record<string, unknown>).url)
    );
}

/** Whether a value has been resolved: it has more than its URL. */
function isResolved(value: EmbedValue): boolean {
    return Object.keys(value).some((key) => key !== 'url');
}

/**
 * A URL of a video, a sound or a post, with the preview the backend gets from its provider's
 * oEmbed: its thumbnail, title and provider. The URL is kept as soon as it is typed, and its
 * preview follows. Without an embed source, the value is the URL alone.
 */
export function EmbedField({
    value,
    onChange,
    onBlur,
    embedSource: embedSourceProp,
    errors = [],
    disabled,
    readOnly,
    required,
    ...props
}: EmbedFieldProps) {
    const intl = usePanneauIntl();
    const context = useFieldsContext();
    const embedSource = embedSourceProp === undefined ? context.embedSource : embedSourceProp;
    const url = value?.url ?? '';
    const [status, setStatus] = useState<{ url: string; state: 'loading' | 'failed' } | null>(null);

    // Resolves a URL that hasn't been, after a pause in typing
    const pending = value !== null && value !== undefined && !isResolved(value) ? value.url : null;
    // `onChange` changes on every render of a form: the latest one gets the preview
    const resolved = useEffectEvent((embed: EmbedValue) => onChange?.(embed));
    useEffect(() => {
        if (embedSource === null || pending === null || !URL.canParse(pending)) {
            return undefined;
        }
        const controller = new AbortController();
        const timeout = window.setTimeout(() => {
            setStatus({ url: pending, state: 'loading' });
            embedSource
                .resolve(pending, { signal: controller.signal })
                .then((embed) => {
                    setStatus(null);
                    resolved({ ...embed, url: pending });
                })
                .catch(() => {
                    if (!controller.signal.aborted) {
                        setStatus({ url: pending, state: 'failed' });
                    }
                });
        }, RESOLVE_DELAY);
        return () => {
            window.clearTimeout(timeout);
            controller.abort();
        };
    }, [embedSource, pending]);

    const current = status !== null && status.url === url ? status.state : null;
    const shownErrors =
        current === 'failed' && errors.length === 0
            ? [intl.formatMessage(messages.embedFailed)]
            : errors;
    return (
        <div className={styles.embed}>
            <TextInput
                {...props}
                type="url"
                inputMode="url"
                autoComplete="off"
                value={url}
                onChange={(next) => onChange?.(next.trim() === '' ? null : { url: next.trim() })}
                onBlur={() => onBlur?.()}
                errors={shownErrors}
                isDisabled={disabled}
                isReadOnly={readOnly}
                isRequired={required}
            />
            {current === 'loading' ? (
                <div className={styles.status} role="status">
                    <Spinner size="sm" />
                    {intl.formatMessage(messages.embedLoading)}
                </div>
            ) : null}
            {value !== null && value !== undefined && isResolved(value) ? (
                <a className={styles.preview} href={value.url} target="_blank" rel="noreferrer">
                    {value.thumbnailUrl !== undefined ? (
                        <img className={styles.thumbnail} src={value.thumbnailUrl} alt="" />
                    ) : null}
                    <span className={styles.text}>
                        <span className={styles.title}>{value.title ?? value.url}</span>
                        {value.provider !== undefined ? (
                            <span className={styles.provider}>{value.provider}</span>
                        ) : null}
                    </span>
                </a>
            ) : null}
        </div>
    );
}

/** The `embed` type: its preview comes from the embed source of the `FieldsProvider`. */
export function EmbedFieldEntry(props: FieldEntryProps) {
    return (
        <EmbedField
            {...getFieldProps(props)}
            value={isEmbed(props.value) ? props.value : null}
            onChange={props.onChange}
        />
    );
}
