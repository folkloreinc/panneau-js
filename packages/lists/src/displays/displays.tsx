import { Check, Minus } from 'lucide-react';

import { toReferences } from '@panneau/fields';
import { formatDuration } from '@panneau/fields/duration';
import { Badge, Icon, type Tone, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import type { DisplayEntry, DisplayProps } from '../types';
import { findOption, getFieldOptions, toText } from '../values';
import styles from './Displays.module.css';

/** What a cell shows without a value. Hidden from assistive technologies, which skip the cell. */
export function EmptyValue() {
    return (
        <span className={styles.empty} aria-hidden="true">
            —
        </span>
    );
}

function isEmpty(value: unknown): boolean {
    return (
        value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
    );
}

/**
 * Text, on two lines at most. The default display. The value of a `secret` text field
 * (`settings.secret`) shows as dots, never in clear.
 */
export function TextDisplay({ value, field }: DisplayProps) {
    const intl = usePanneauIntl();
    const text = toText(value, intl.locale);
    if (text === '') {
        return <EmptyValue />;
    }
    if (field?.settings?.secret === true) {
        return (
            <span role="img" aria-label={intl.formatMessage(messages.secretValue)}>
                ••••••••
            </span>
        );
    }
    return <span className={styles.text}>{text}</span>;
}

/** HTML as plain text. */
export function RichTextDisplay({ value }: DisplayProps) {
    const text =
        typeof value === 'string'
            ? value
                  .replace(/<[^>]*>/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim()
            : '';
    return text === '' ? <EmptyValue /> : <span className={styles.text}>{text}</span>;
}

/** A number, in the format of the locale. */
export function NumberDisplay({ value }: DisplayProps) {
    const intl = usePanneauIntl();
    const number =
        typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
    if (Number.isNaN(number) || isEmpty(value)) {
        return <EmptyValue />;
    }
    return <span className={styles.number}>{intl.formatNumber(number)}</span>;
}

/** Yes or no, as an icon with its label. */
export function BooleanDisplay({ value }: DisplayProps) {
    const intl = usePanneauIntl();
    if (value === null || value === undefined) {
        return <EmptyValue />;
    }
    const checked = value === true || value === 1 || value === 'true' || value === '1';
    return (
        <span className={`${styles.boolean} ${checked ? styles.true : styles.false}`}>
            <Icon
                icon={checked ? Check : Minus}
                label={intl.formatMessage(checked ? messages.yes : messages.no)}
            />
        </span>
    );
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_ONLY = /^(\d{2}):(\d{2})(?::(\d{2}))?$/;

/** A date (`2026-10-15`) as a local date, so that it doesn't move with the time zone. */
function parseDate(value: unknown): Date | null {
    if (typeof value !== 'string' || value === '') {
        return null;
    }
    const day = DATE_ONLY.exec(value);
    const date =
        day !== null
            ? new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]))
            : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

/** A date, in the format of the locale. */
export function DateDisplay({ value }: DisplayProps) {
    const intl = usePanneauIntl();
    const date = parseDate(value);
    if (date === null) {
        return <EmptyValue />;
    }
    return <time dateTime={String(value)}>{intl.formatDate(date, { dateStyle: 'medium' })}</time>;
}

/** A date and a time, in the format and the time zone of the user. */
export function DateTimeDisplay({ value }: DisplayProps) {
    const intl = usePanneauIntl();
    const date = parseDate(value);
    if (date === null) {
        return <EmptyValue />;
    }
    return (
        <time dateTime={String(value)}>
            {intl.formatDate(date, { dateStyle: 'medium', timeStyle: 'short' })}
        </time>
    );
}

/** A time of day (`14:30`), in the format of the locale. */
export function TimeDisplay({ value }: DisplayProps) {
    const intl = usePanneauIntl();
    const match = typeof value === 'string' ? TIME_ONLY.exec(value) : null;
    if (match === null) {
        return <EmptyValue />;
    }
    const date = new Date(2000, 0, 1, Number(match[1]), Number(match[2]), Number(match[3] ?? 0));
    return <time dateTime={String(value)}>{intl.formatTime(date, { timeStyle: 'short' })}</time>;
}

/** The labels of the selected options, as badges. */
export function SelectDisplay({ value, field }: DisplayProps) {
    const options = getFieldOptions(field);
    const values: unknown[] = Array.isArray(value) ? value : isEmpty(value) ? [] : [value];
    if (values.length === 0) {
        return <EmptyValue />;
    }
    return (
        <span className={styles.badges}>
            {values.map((entry) => {
                const option = findOption(options, entry);
                return (
                    <Badge key={String(entry)} tone={(option?.tone ?? 'neutral') as Tone}>
                        {option?.label ?? String(entry)}
                    </Badge>
                );
            })}
        </span>
    );
}

/** The labels of related items. */
export function RelationDisplay({ value }: DisplayProps) {
    const references = toReferences(value);
    if (references.length === 0) {
        return <EmptyValue />;
    }
    return (
        <span className={styles.text}>
            {references.map((reference) => reference.label).join(', ')}
        </span>
    );
}

/** A link that opens the URL. */
export function UrlDisplay({ value }: DisplayProps) {
    if (typeof value !== 'string' || value === '') {
        return <EmptyValue />;
    }
    return (
        <a className={styles.link} href={value} target="_blank" rel="noreferrer">
            {value.replace(/^https?:\/\//, '')}
        </a>
    );
}

/** A link that writes an email. */
export function EmailDisplay({ value }: DisplayProps) {
    if (typeof value !== 'string' || value === '') {
        return <EmptyValue />;
    }
    return (
        <a className={styles.link} href={`mailto:${value}`}>
            {value}
        </a>
    );
}

/** A link that calls the phone number. */
export function TelDisplay({ value }: DisplayProps) {
    if (typeof value !== 'string' || value.trim() === '') {
        return <EmptyValue />;
    }
    return (
        <a className={styles.link} href={`tel:${value.replace(/[^\d+]/g, '')}`}>
            {value}
        </a>
    );
}

/** A duration in seconds, with its units: `1 h 5 min`, to the precision of its field. */
export function DurationDisplay({ value, field }: DisplayProps) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return <EmptyValue />;
    }
    const precision = field?.settings?.precision === 'minutes' ? 'minutes' : 'seconds';
    return <span className={styles.number}>{formatDuration(value, { precision })}</span>;
}

/** JSON on one line, shortened. */
export function JsonDisplay({ value }: DisplayProps) {
    if (value === null || value === undefined || typeof value !== 'object') {
        return <EmptyValue />;
    }
    const json = JSON.stringify(value);
    return (
        <code className={styles.code} title={json.length > 80 ? json : undefined}>
            {json.length > 80 ? `${json.slice(0, 79)}…` : json}
        </code>
    );
}

/** Tags, as badges, with the labels of their options. */
export function TagsDisplay({ value, field }: DisplayProps) {
    const tags = Array.isArray(value) ? value.filter((tag) => typeof tag === 'string') : [];
    if (tags.length === 0) {
        return <EmptyValue />;
    }
    const options = field?.options ?? [];
    return (
        <span className={styles.tags}>
            {tags.map((tag) => (
                <Badge key={tag}>
                    {options.find((option) => String(option.value) === tag)?.label ?? tag}
                </Badge>
            ))}
        </span>
    );
}

/** What a URL embeds: its thumbnail and title, linked to it. */
export function EmbedDisplay({ value }: DisplayProps) {
    if (
        value === null ||
        typeof value !== 'object' ||
        typeof (value as { url?: unknown }).url !== 'string'
    ) {
        return <EmptyValue />;
    }
    const { url, title, thumbnailUrl } = value as {
        url: string;
        title?: unknown;
        thumbnailUrl?: unknown;
    };
    return (
        <a className={`${styles.link} ${styles.media}`} href={url} target="_blank" rel="noreferrer">
            {typeof thumbnailUrl === 'string' ? (
                <img className={styles.thumbnail} src={thumbnailUrl} alt="" />
            ) : null}
            <span className={styles.text}>
                {typeof title === 'string' ? title : url.replace(/^https?:\/\//, '')}
            </span>
        </a>
    );
}

/** A place: its address, or its coordinates. */
export function LocationDisplay({ value }: DisplayProps) {
    const intl = usePanneauIntl();
    if (value === null || typeof value !== 'object') {
        return <EmptyValue />;
    }
    const { lat, lng, address } = value as { lat?: unknown; lng?: unknown; address?: unknown };
    if (typeof address === 'string' && address !== '') {
        return <span className={styles.text}>{address}</span>;
    }
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        return <EmptyValue />;
    }
    const format = (number: number) => intl.formatNumber(number, { maximumFractionDigits: 5 });
    return (
        <span className={styles.number}>
            {format(lat)}, {format(lng)}
        </span>
    );
}

/** A swatch, with the color's code. */
export function ColorDisplay({ value }: DisplayProps) {
    if (typeof value !== 'string' || value === '') {
        return <EmptyValue />;
    }
    return (
        <span className={styles.color}>
            <span className={styles.swatch} style={{ backgroundColor: value }} aria-hidden="true" />
            {value}
        </span>
    );
}

/** A thumbnail and the name of a media item (or of the first one). */
export function MediaDisplay({ value }: DisplayProps) {
    const media: unknown = Array.isArray(value) ? value[0] : value;
    if (media === null || typeof media !== 'object') {
        return <EmptyValue />;
    }
    const { thumbnailUrl, url, name, filename } = media as Record<string, unknown>;
    const source =
        typeof thumbnailUrl === 'string' ? thumbnailUrl : typeof url === 'string' ? url : null;
    const label = typeof name === 'string' ? name : typeof filename === 'string' ? filename : '';
    return (
        <span className={styles.media}>
            {source !== null ? <img className={styles.thumbnail} src={source} alt="" /> : null}
            {label !== '' ? <span className={styles.text}>{label}</span> : null}
        </span>
    );
}

/**
 * The built-in displays, by name. A column's display is its `display`, its field's `display`, or
 * its field's type: field types are display names. Values without a known display are shown as
 * text.
 */
export const builtInDisplays: Readonly<Record<string, DisplayEntry>> = {
    text: TextDisplay,
    textarea: TextDisplay,
    slug: TextDisplay,
    richtext: RichTextDisplay,
    number: NumberDisplay,
    boolean: BooleanDisplay,
    date: DateDisplay,
    datetime: DateTimeDisplay,
    time: TimeDisplay,
    select: SelectDisplay,
    relation: RelationDisplay,
    url: UrlDisplay,
    email: EmailDisplay,
    color: ColorDisplay,
    media: MediaDisplay,
    tel: TelDisplay,
    range: NumberDisplay,
    duration: DurationDisplay,
    json: JsonDisplay,
    tags: TagsDisplay,
    embed: EmbedDisplay,
    location: LocationDisplay,
};
