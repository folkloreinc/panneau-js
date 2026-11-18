import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-aria-components';

import { chartColors } from '../theme/chartColors';
import { toneClass } from '../theme/toneClass';
import type { Tone } from '../theme/tones';
import { cx } from '../utils/cx';
import styles from './ChartLegend.module.css';

/** An entry of a `ChartLegend`: a line or an area of a chart. */
export interface ChartLegendItem {
    /** Its name: `Emails`. */
    label: string;
    /** Its value, formatted: its total over the chart. */
    value?: ReactNode;
    /** A line under its name: `4 failed`. */
    help?: ReactNode;
    /** The tone of `help`, when it calls for attention, which its words say too. */
    helpTone?: Tone | undefined;
    /** Its categorical color, from 0: the color of its line. Defaults to its place. */
    color?: number | undefined;
    /** The solid color of a tone instead, as its line. */
    tone?: Tone | undefined;
    /** Makes its name a link: to the list of what it counts. */
    href?: string | undefined;
}

export interface ChartLegendProps {
    /** What the legend is of, for assistive technologies: the name of the chart. */
    label: string;
    items: ChartLegendItem[];
    className?: string | undefined;
}

/**
 * The legend of a chart with several lines or areas: the color, the name, the value and a line of
 * help of each, in the order of the chart. The colors repeat those of the chart, whose names say
 * which is which: assistive technologies read a list of names and values.
 */
export function ChartLegend({ label, items, className }: ChartLegendProps) {
    return (
        <ul aria-label={label} className={cx('panneau-chart-legend', styles.legend, className)}>
            {items.map((item, index) => (
                <li key={`${index}-${item.label}`} className={styles.item}>
                    <span
                        aria-hidden="true"
                        className={cx(
                            styles.swatch,
                            item.tone !== undefined && styles.toned,
                            item.tone !== undefined && toneClass(item.tone),
                        )}
                        style={
                            {
                                '--_panneau-chart-legend-color': chartColors.categorical(
                                    item.color ?? index,
                                ),
                            } as CSSProperties
                        }
                    />
                    <span className={styles.text}>
                        {item.href !== undefined ? (
                            <Link href={item.href} className={styles.label}>
                                {item.label}
                            </Link>
                        ) : (
                            <span className={styles.label}>{item.label}</span>
                        )}
                        {item.help !== undefined && item.help !== null ? (
                            <span
                                className={cx(
                                    styles.help,
                                    item.helpTone !== undefined && styles.helpToned,
                                    item.helpTone !== undefined && toneClass(item.helpTone),
                                )}
                            >
                                {item.help}
                            </span>
                        ) : null}
                    </span>
                    {item.value !== undefined && item.value !== null ? (
                        <span className={styles.value}>{item.value}</span>
                    ) : null}
                </li>
            ))}
        </ul>
    );
}
