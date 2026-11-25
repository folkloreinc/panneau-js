import { usePanneauIntl } from '@panneau/ui';

import styles from './TimeZoneLabel.module.css';
import { formatTimeZone, formatTimeZoneShort } from './timeZones';

export interface TimeZoneLabelProps {
    /** An IANA zone (`America/Toronto`). */
    zone: string;
    /** The date of the offset: it changes with daylight saving time. Defaults to now. */
    date?: Date | null | undefined;
}

/**
 * The zone that date-times are shown and typed in, for the line under their control: in short,
 * `UTC−4 · America/Toronto`. Its name in the locale with its offset (`Eastern Time (UTC−4)`) is
 * its tooltip, and what assistive technologies read.
 */
export function TimeZoneLabel({ zone, date }: TimeZoneLabelProps) {
    const intl = usePanneauIntl();
    const at = date ?? new Date();
    const name = formatTimeZone(zone, intl.locale, at);
    return (
        <span className={styles.zone} title={name}>
            <span aria-hidden="true">{formatTimeZoneShort(zone, at)}</span>
            <span className={styles.visuallyHidden}>{name}</span>
        </span>
    );
}
