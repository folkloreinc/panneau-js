import { ArrowDown, ArrowUp } from 'lucide-react';
import { type ReactNode, useId } from 'react';
import { Link } from 'react-aria-components';
import type { FormatNumberOptions } from 'react-intl';

import { Icon } from '../icon/Icon';
import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { Meter } from '../meter/Meter';
import { Skeleton } from '../skeleton/Skeleton';
import { toneClass } from '../theme/toneClass';
import type { Tone } from '../theme/tones';
import { cx } from '../utils/cx';
import styles from './Stat.module.css';

/** The change of a stat from a previous value: its direction and what it is. */
export interface StatChange {
    /** Up or down, drawn as an arrow and said to assistive technologies; `none` without a change. */
    direction: 'up' | 'down' | 'none';
    /** The change, from what: `12% from the previous 30 days`. */
    label: ReactNode;
    /**
     * `success` or `danger` when the change is good or bad news, which the label or the context
     * says too. Neutral by default: a rise isn't always good.
     */
    tone?: Tone | undefined;
}

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
    /**
     * A target for the number (a budget, a quota), above 0: a meter under the number. Past the
     * target, the meter takes the `tone`, or `danger` without one.
     */
    target?: number | null | undefined;
    /** The change from a previous value, under the number: `↑ 12% from the previous 30 days`. */
    change?: StatChange | undefined;
    className?: string;
}

/**
 * A number in large type, with what it counts and a line of help, and a meter of its target when it
 * has one: a stat of a dashboard.
 */
export function Stat({
    label,
    value,
    format,
    help,
    tone,
    href,
    target,
    change,
    className,
}: StatProps) {
    const intl = usePanneauIntl();
    const labelId = useId();
    const isLoading = value === undefined;
    const hasLabel = label !== undefined && label !== null;
    const content = (
        <>
            {hasLabel ? (
                <div id={labelId} className={styles.label}>
                    {label}
                </div>
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
                    {change !== undefined ? (
                        <div
                            className={cx(
                                styles.change,
                                change.tone !== undefined && styles.changeToned,
                                change.tone !== undefined && toneClass(change.tone),
                            )}
                        >
                            {change.direction !== 'none' ? (
                                <>
                                    <Icon
                                        icon={change.direction === 'up' ? ArrowUp : ArrowDown}
                                        size="sm"
                                        className={styles.changeIcon}
                                    />
                                    <span className={styles.visuallyHidden}>
                                        {intl.formatMessage(
                                            change.direction === 'up'
                                                ? messages.statChangeUp
                                                : messages.statChangeDown,
                                        )}{' '}
                                    </span>
                                </>
                            ) : null}
                            <span>{change.label}</span>
                        </div>
                    ) : null}
                    {typeof value === 'number' &&
                    target !== undefined &&
                    target !== null &&
                    target > 0 ? (
                        <Meter
                            value={value}
                            target={target}
                            tone={value > target ? (tone ?? 'danger') : undefined}
                            formatValue={(number) => intl.formatNumber(number, format)}
                            {...(hasLabel && { 'aria-labelledby': labelId })}
                            className={styles.meter}
                        />
                    ) : null}
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
