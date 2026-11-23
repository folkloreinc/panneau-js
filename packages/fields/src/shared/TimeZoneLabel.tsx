import { usePanneauIntl } from '@panneau/ui';

import styles from './TimeZoneLabel.module.css';
import { formatTimeZone } from './timeZones';

export interface TimeZoneLabelProps {
    /** An IANA zone (`America/Toronto`). */
    zone: string;
    /** The date of the offset: it changes with daylight saving time. Defaults to now. */
    date?: Date | null | undefined;
    id?: string;
}

/**
 * The zone that date-times are shown and typed in, by its name in the locale and its offset at
 * that date: `Eastern Time (UTC−4)`. Its IANA id is its title.
 */
export function TimeZoneLabel({ zone, date, id }: TimeZoneLabelProps) {
    const intl = usePanneauIntl();
    return (
        <span id={id} className={styles.zone} title={zone}>
            {formatTimeZone(zone, intl.locale, date ?? new Date())}
        </span>
    );
}
