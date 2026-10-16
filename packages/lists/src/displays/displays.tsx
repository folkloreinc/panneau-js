import { Check, Minus } from 'lucide-react';

import { toReferences } from '@panneau/fields';
import { Badge, Icon, usePanneauIntl } from '@panneau/ui';

import { messages } from '../messages';
import type { DisplayEntry, DisplayProps } from '../types';
import { getFieldOptions, getOptionLabel, toText } from '../values';
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

/** Text, on two lines at most. The default display. */
export function TextDisplay({ value }: DisplayProps) {
    const intl = usePanneauIntl();
    const text = toText(value, intl.locale);
    return text === '' ? <EmptyValue /> : <span className={styles.text}>{text}</span>;
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
            {values.map((entry) => (
                <Badge key={String(entry)}>{getOptionLabel(options, entry) ?? String(entry)}</Badge>
            ))}
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
};
