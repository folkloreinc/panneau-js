import type { CSSProperties } from 'react';
import { Link } from 'react-aria-components';

import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { Skeleton } from '../skeleton/Skeleton';
import { chartColors } from '../theme/chartColors';
import { toneClass } from '../theme/toneClass';
import type { Tone } from '../theme/tones';
import { cx } from '../utils/cx';
import styles from './BarChart.module.css';

/** A bar of a `BarChart`: a part of the total. */
export interface BarChartItem {
    /** What the part is: `Failed`. */
    label: string;
    value: number;
    /** Colors the bar with the solid color of a tone, as the tone of an option of a `select`. */
    tone?: Tone | undefined;
    /** Makes the label a link: to the list of what the bar counts. */
    href?: string | undefined;
}

export interface BarChartProps {
    /** What the chart shows: the name of its list, for assistive technologies. */
    label: string;
    /** The parts, in any order: the largest are drawn first. Left `undefined` while they load. */
    items?: BarChartItem[] | undefined;
    /** The rest of the total, past the items: a last row, "Other", whatever its size. */
    other?: number | null | undefined;
    /** Formats a value. Defaults to a number of the locale. */
    formatValue?: (value: number) => string;
    /** The categorical color of the bars without a tone, from 0. Defaults to the first. */
    color?: number;
    className?: string;
}

/** Rows of the skeleton. */
const SKELETON_ROWS = [80, 55, 30];

/**
 * Horizontal bars of the parts of a total, the largest first, each with its label and its value
 * formatted for the locale, and the rest of the total last, as "Other". Bars are on the categorical
 * chart colors of the theme, or the color of their tone, and as long as their value against the
 * largest one. Assistive technologies read a list of labels and values; the bars are hidden from
 * them.
 */
export function BarChart({
    label,
    items,
    other,
    formatValue,
    color = 0,
    className,
}: BarChartProps) {
    const intl = usePanneauIntl();
    const format = formatValue ?? ((value: number) => intl.formatNumber(value));
    const style = { '--_panneau-bar-chart-color': chartColors.categorical(color) } as CSSProperties;
    if (items === undefined) {
        return (
            <div className={cx('panneau-bar-chart', styles.chart, className)} style={style}>
                {SKELETON_ROWS.map((width) => (
                    <div key={width} className={styles.row}>
                        <Skeleton width={`${width / 2 + 20}%`} />
                        <Skeleton
                            shape="rect"
                            width={`${width}%`}
                            height="var(--panneau-bar-chart-bar-height, 0.5rem)"
                        />
                    </div>
                ))}
            </div>
        );
    }
    const rest = other !== undefined && other !== null && other > 0 ? other : null;
    // The largest first; equal parts keep their order
    const sorted = [...items].sort((a, b) => b.value - a.value);
    const largest = Math.max(0, rest ?? 0, ...sorted.map((item) => item.value));
    const rows: (BarChartItem & { isOther?: boolean })[] = [
        ...sorted,
        ...(rest !== null
            ? [{ label: intl.formatMessage(messages.barChartOther), value: rest, isOther: true }]
            : []),
    ];
    return (
        <ul
            aria-label={label}
            className={cx('panneau-bar-chart', styles.chart, className)}
            style={style}
        >
            {rows.map((row, index) => (
                <li
                    key={`${index}-${row.label}`}
                    className={cx(
                        styles.row,
                        row.isOther === true && styles.other,
                        row.tone !== undefined && styles.toned,
                        row.tone !== undefined && toneClass(row.tone),
                    )}
                >
                    <div className={styles.text}>
                        {row.href !== undefined ? (
                            <Link href={row.href} className={styles.label}>
                                {row.label}
                            </Link>
                        ) : (
                            <span className={styles.label}>{row.label}</span>
                        )}
                        <span className={styles.value}>{format(row.value)}</span>
                    </div>
                    <div className={styles.track} aria-hidden="true">
                        {row.value > 0 && largest > 0 ? (
                            <div
                                className={styles.bar}
                                style={{ width: `${(row.value / largest) * 100}%` }}
                            />
                        ) : null}
                    </div>
                </li>
            ))}
        </ul>
    );
}
