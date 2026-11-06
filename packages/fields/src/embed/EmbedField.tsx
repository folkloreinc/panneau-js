import { ExternalLink } from 'lucide-react';
import { type ReactNode, useEffect, useEffectEvent, useState } from 'react';

import { formsMessages } from '@panneau/intl';
import type { EmbedValue } from '@panneau/protocol';
import { LinkButton, Spinner, TextInput, Tooltip, usePanneauIntl } from '@panneau/ui';

import { splitDuration } from '../duration/DurationField';
import { useFieldsContext } from '../shared/context';
import type { EmbedSource } from '../shared/embed';
import { findRule, getFieldProps, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import styles from './EmbedField.module.css';

export type { EmbedValue };

const RESOLVE_DELAY = 500;

export interface EmbedFieldProps extends FieldProps<EmbedValue> {
    placeholder?: string;
    /** Where the preview comes from. Defaults to that of the `FieldsProvider`. */
    embedSource?: EmbedSource | null;
    /**
     * The providers an embed may come from (`YouTube`), compared without case: the `providers`
     * rule (decision 0058). The field names them under its help, and refuses an embed of another
     * provider as soon as its preview comes back. The form's errors, once shown, replace that one.
     */
    providers?: readonly string[];
}

/** Whether a value is an embed: an object with a `url`. */
export function isEmbed(value: unknown): value is EmbedValue {
    return (
        value !== null &&
        typeof value === 'object' &&
        isString((value as Record<string, unknown>).url)
    );
}

/** Whether an embed comes from one of the providers. One without a provider is left to the backend. */
function isAllowed(value: EmbedValue, providers: readonly string[] | undefined): boolean {
    if (providers === undefined || providers.length === 0 || value.provider === undefined) {
        return true;
    }
    const provider = value.provider.toLowerCase();
    return providers.some((allowed) => allowed.toLowerCase() === provider);
}

/** Whether a value has been resolved: it has more than its URL. */
function isResolved(value: EmbedValue): boolean {
    return Object.keys(value).some((key) => key !== 'url');
}

/**
 * A duration as players show it, and its ISO 8601 form for `<time>`: `2:14` (`PT2M14S`), `1:02:03`.
 */
function playbackTime(duration: number): { text: string; iso: string } {
    const { hours, minutes, seconds } = splitDuration(duration);
    const pad = (count: number) => String(count).padStart(2, '0');
    return {
        text:
            hours > 0
                ? `${String(hours)}:${pad(minutes)}:${pad(seconds)}`
                : `${String(minutes)}:${pad(seconds)}`,
        iso: `PT${String(hours)}H${String(minutes)}M${String(seconds)}S`,
    };
}

/** How long a video or a sound lasts, as players show it. */
function Duration({ duration, className }: { duration: number; className?: string }) {
    const { text, iso } = playbackTime(duration);
    return (
        <time className={className} dateTime={iso}>
            {text}
        </time>
    );
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
    providers,
    errors = [],
    disabled,
    readOnly,
    required,
    description,
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
    const providerList =
        providers !== undefined && providers.length > 0
            ? intl.formatList(providers, { type: 'disjunction' })
            : null;
    const ownError =
        current === 'failed'
            ? intl.formatMessage(messages.embedFailed)
            : value !== null &&
                value !== undefined &&
                providerList !== null &&
                !isAllowed(value, providers)
              ? intl.formatMessage(formsMessages.rule.providers, { providers: providerList })
              : null;
    const shownErrors = ownError !== null && errors.length === 0 ? [ownError] : errors;
    const help: ReactNode =
        providerList !== null ? (
            <>
                {description !== undefined && description !== null ? <>{description} </> : null}
                {intl.formatMessage(messages.embedProviders, {
                    providers: intl.formatList(providers ?? [], { type: 'conjunction' }),
                })}
            </>
        ) : (
            description
        );
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
                description={help}
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
                <EmbedPreview value={value} />
            ) : null}
        </div>
    );
}

/**
 * What a URL embeds: its thumbnail, with the duration of a video or a sound over it, its title and
 * provider, and a link that opens it in a new window.
 */
function EmbedPreview({ value }: { value: EmbedValue }) {
    const intl = usePanneauIntl();
    const openLabel = intl.formatMessage(messages.openEmbed);
    const duration =
        typeof value.duration === 'number' && Number.isFinite(value.duration)
            ? value.duration
            : null;
    const thumbnail = value.thumbnailUrl !== undefined;
    return (
        <div className={styles.preview}>
            {thumbnail ? (
                <span className={styles.media}>
                    <img className={styles.thumbnail} src={value.thumbnailUrl} alt="" />
                    {duration !== null ? (
                        <Duration duration={duration} className={styles.duration} />
                    ) : null}
                </span>
            ) : null}
            <span className={styles.text}>
                <span className={styles.title}>{value.title ?? value.url}</span>
                {value.provider !== undefined || (duration !== null && !thumbnail) ? (
                    <span className={styles.meta}>
                        {value.provider !== undefined ? <span>{value.provider}</span> : null}
                        {/* Without a thumbnail to show it on, the duration follows the provider. */}
                        {duration !== null && !thumbnail ? <Duration duration={duration} /> : null}
                    </span>
                ) : null}
            </span>
            <Tooltip content={openLabel}>
                <LinkButton
                    href={value.url}
                    external
                    size="sm"
                    appearance="ghost"
                    icon={ExternalLink}
                    aria-label={openLabel}
                    className={styles.open}
                />
            </Tooltip>
        </div>
    );
}

/** The providers of a `providers` rule, if the field has one. */
function getProviders(field: FieldEntryProps['field']): string[] | undefined {
    const rule = findRule(field, 'providers');
    return rule !== undefined && 'value' in rule && Array.isArray(rule.value)
        ? rule.value.filter(isString)
        : undefined;
}

/**
 * The `embed` type: its preview comes from the embed source of the `FieldsProvider`, and its
 * `providers` rule names the providers it allows.
 */
export function EmbedFieldEntry(props: FieldEntryProps) {
    const providers = getProviders(props.field);
    return (
        <EmbedField
            {...getFieldProps(props)}
            value={isEmbed(props.value) ? props.value : null}
            onChange={props.onChange}
            {...(providers !== undefined ? { providers } : {})}
        />
    );
}
