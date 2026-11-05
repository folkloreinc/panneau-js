import type { CSSProperties } from 'react';

import { usePanneauIntl } from '../intl/usePanneauIntl';
import { Skeleton } from '../skeleton/Skeleton';
import { chartColors } from '../theme/chartColors';
import { cx } from '../utils/cx';
import styles from './LineChart.module.css';

/** A point of a `LineChart`. */
export interface LineChartPoint {
    /** What the point is, under the chart and in its table: a day, a week, a month. */
    label: string;
    value: number;
}

export interface LineChartProps {
    /** What the chart shows: the caption of its table, for assistive technologies. */
    label: string;
    /** The points, in order. Left `undefined` while they load: a skeleton of the plot. */
    points?: LineChartPoint[] | undefined;
    /** Formats a value, in the table and the top of the scale. Defaults to a number of the locale. */
    formatValue?: (value: number) => string;
    /** Height of the plot, without the labels: `'10rem'`. Defaults to the `height` token. */
    height?: string;
    /** The categorical color of the line, from 0. Defaults to the first. */
    color?: number;
    className?: string;
}

/** Points get dots up to this count: past it, only the last one has one. */
const MAX_DOTS = 31;

/**
 * A line of values over time, on the categorical chart colors of the theme: the line, the area
 * under it, the top of its scale, and the labels of its first and last points. The plot is hidden
 * from assistive technologies, which read the values in a table instead.
 */
export function LineChart({
    label,
    points,
    formatValue,
    height,
    color = 0,
    className,
}: LineChartProps) {
    const intl = usePanneauIntl();
    const format = formatValue ?? ((value: number) => intl.formatNumber(value));
    const style = {
        '--_panneau-line-chart-color': chartColors.categorical(color),
        ...(height !== undefined ? { '--_panneau-line-chart-height': height } : {}),
    } as CSSProperties;
    if (points === undefined) {
        return (
            <div className={cx('panneau-line-chart', styles.chart, className)} style={style}>
                <div className={styles.plot}>
                    <Skeleton shape="rect" height="100%" />
                </div>
                <Skeleton width="100%" />
            </div>
        );
    }
    const values = points.map((point) => point.value);
    const low = Math.min(0, ...values);
    const high = Math.max(low + 1, ...values);
    // Room above the highest point, for the width of the line and its dot
    const top = high + (high - low) * 0.08;
    const x = (index: number) => (points.length === 1 ? 50 : (index / (points.length - 1)) * 100);
    const y = (value: number) => 100 - ((value - low) / (top - low)) * 100;
    const line = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'}${x(index)},${y(point.value)}`)
        .join(' ');
    const zero = y(Math.max(low, 0));
    const first = points[0];
    const last = points.at(-1);
    return (
        <figure className={cx('panneau-line-chart', styles.chart, className)} style={style}>
            <div className={styles.plot}>
                <svg
                    className={styles.svg}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    focusable="false"
                >
                    <line className={styles.baseline} x1="0" x2="100" y1={zero} y2={zero} />
                    {points.length > 1 ? (
                        <>
                            <path
                                className={styles.area}
                                d={`${line} L${x(points.length - 1)},${zero} L${x(0)},${zero} Z`}
                            />
                            <path className={styles.line} d={line} />
                        </>
                    ) : null}
                    {points.map((point, index) =>
                        points.length <= MAX_DOTS || index === points.length - 1 ? (
                            <path
                                key={point.label}
                                className={styles.dot}
                                d={`M${x(index)},${y(point.value)} h0`}
                            >
                                <title>{`${point.label}: ${format(point.value)}`}</title>
                            </path>
                        ) : null,
                    )}
                </svg>
                {points.length > 0 ? (
                    <span className={styles.max} aria-hidden="true">
                        {format(Math.max(...values))}
                    </span>
                ) : null}
            </div>
            {first !== undefined && last !== undefined ? (
                <div className={styles.labels} aria-hidden="true">
                    <span>{first.label}</span>
                    {points.length > 1 ? <span>{last.label}</span> : null}
                </div>
            ) : null}
            <table className={styles.visuallyHidden}>
                <caption>{label}</caption>
                <tbody>
                    {points.map((point) => (
                        <tr key={point.label}>
                            <th scope="row">{point.label}</th>
                            <td>{format(point.value)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </figure>
    );
}
