import type { ReactNode } from 'react';
import { Link } from 'react-aria-components';
import type { FormatNumberOptions } from 'react-intl';

import { usePanneauIntl } from '../intl/usePanneauIntl';
import { Skeleton } from '../skeleton/Skeleton';
import { toneClass } from '../theme/toneClass';
import type { Tone } from '../theme/tones';
import { cx } from '../utils/cx';
import styles from './Stat.module.css';

export interface StatProps {
    /** What the number counts. */
    label?: ReactNode;
    /**
     * The number, formatted for the locale, or text already formatted. Left `undefined` while it
     * loads: a skeleton of the number and its help, in a `LoadingRegion` of the caller.
     */
    value?: number | string | undefined;
    /** Options of `Intl.NumberFormat` for a number: a currency, a percent, compact. */
    format?: FormatNumberOptions;
    /** A line under the number: `3 more than last week`. */
    help?: ReactNode;
    /**
     * Colors the number, only when it calls for attention (`warning`, `danger`): the help says why,
     * since color alone says nothing to some users. Neutral by default, and at 0.
     */
    tone?: Tone | undefined;
    /** Makes the stat a link: to the list of what it counts. */
    href?: string | undefined;
    className?: string;
}

/** A number in large type, with what it counts and a line of help: a stat of a dashboard. */
export function Stat({ label, value, format, help, tone, href, className }: StatProps) {
    const intl = usePanneauIntl();
    const isLoading = value === undefined;
    const content = (
        <>
            {label !== undefined && label !== null ? (
                <div className={styles.label}>{label}</div>
            ) : null}
            {isLoading ? (
                <>
                    <span className={styles.value}>
                        <Skeleton width="3ch" />
                    </span>
                    {help !== undefined ? (
                        <span className={styles.help}>
                            <Skeleton width="60%" />
                        </span>
                    ) : null}
                </>
            ) : (
                <>
                    <div className={styles.value}>
                        {typeof value === 'number' ? intl.formatNumber(value, format) : value}
                    </div>
                    {help !== undefined && help !== null ? (
                        <div className={styles.help}>{help}</div>
                    ) : null}
                </>
            )}
        </>
    );
    const classes = cx(
        'panneau-stat',
        styles.stat,
        tone !== undefined && !isLoading && styles.toned,
        tone !== undefined && !isLoading && toneClass(tone),
        className,
    );
    return href !== undefined && !isLoading ? (
        <Link href={href} className={classes}>
            {content}
        </Link>
    ) : (
        <div className={classes}>{content}</div>
    );
}
