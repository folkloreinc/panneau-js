import { type CSSProperties, type KeyboardEvent, type PointerEvent, useId, useState } from 'react';

import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { Skeleton } from '../skeleton/Skeleton';
import { chartColors } from '../theme/chartColors';
import { cx } from '../utils/cx';
import styles from './LineChart.module.css';
import { type PlotPoint, axisLabelIndices, linearPath, monotonePath, niceScale } from './geometry';

/** A point of a `LineChart`. */
export interface LineChartPoint {
    /** What the point is, in its table and its tooltip: a day, a week, a month. */
    label: string;
    /** A shorter label, under the chart: `Oct 5`. The `label` by default. */
    shortLabel?: string | undefined;
    value: number;
}

export interface LineChartProps {
    /** What the chart shows: the caption of its table, for assistive technologies. */
    label: string;
    /** The points, in order. Left `undefined` while they load: a skeleton of the plot. */
    points?: LineChartPoint[] | undefined;
    /** Formats a value: in the table, the labels on the line and the tooltip. A number of the locale by default. */
    formatValue?: ((value: number) => string) | undefined;
    /**
     * Formats a graduation of the scale, short: `1 min`, `25 %`. A number of the locale by default,
     * compact (`10K`) on a scale that reaches 10,000.
     */
    formatTick?: ((value: number) => string) | undefined;
    /** What the values are, above the scale: `Entries`, `Minutes`. */
    axisLabel?: string | undefined;
    /**
     * Shows the scale: round graduations, with a line across the plot for each. Without it, a line
     * at 0 alone, for a chart that only shows a trend. `true` by default.
     */
    showAxis?: boolean | undefined;
    /** Writes the last value at the end of the line. `true` by default. */
    showLast?: boolean | undefined;
    /** Marks the highest value on the line, with its value. */
    showMax?: boolean | undefined;
    /**
     * Shows the value of the point under the pointer, or chosen with the arrow keys: for a long
     * series, where a point can't be read from the scale. Off by default: the values a chart needs
     * are on it, and every one is in its table.
     */
    isInteractive?: boolean | undefined;
    /**
     * Fixes the bounds of the scale: `{ min: 0, max: 1 }` for a ratio. From 0, or the lowest value
     * under it, to a round value above the highest by default.
     */
    domain?: { min?: number | undefined; max?: number | undefined } | undefined;
    /** `monotone` (default) curves through the points without going past them, `linear` joins them straight. */
    curve?: 'monotone' | 'linear' | undefined;
    /** Height of the plot, without the labels: `'10rem'`. Defaults to the `height` token. */
    height?: string | undefined;
    /** The categorical color of the line, from 0. Defaults to the first. */
    color?: number | undefined;
    className?: string | undefined;
}

/** At most this number of labels under the chart, half of them when it is narrow. */
const MAX_AXIS_LABELS = 7;

/** Closer than this (in percents of the width), the highest value isn't labeled beside the last one. */
const LABEL_GAP = 12;

/**
 * A line of values over time, on the categorical chart colors of the theme: a curve and the area
 * under it, a scale of round graduations, labels of dates under it, and the last value at the end
 * of the line. The plot is hidden from assistive technologies, which read the values in a table;
 * with `isInteractive`, the pointer and the arrow keys also show the value of each point.
 */
export function LineChart({
    label,
    points,
    formatValue,
    formatTick,
    axisLabel,
    showAxis = true,
    showLast = true,
    showMax = false,
    isInteractive = false,
    domain,
    curve = 'monotone',
    height,
    color = 0,
    className,
}: LineChartProps) {
    const intl = usePanneauIntl();
    const gradientId = `panneau-line-chart-${useId().replace(/[^\w-]/g, '')}`;
    const [active, setActive] = useState<number | null>(null);
    const format = formatValue ?? ((value: number) => intl.formatNumber(value));
    const style = {
        '--_panneau-line-chart-color': chartColors.categorical(color),
        ...(height !== undefined ? { '--_panneau-line-chart-height': height } : {}),
    } as CSSProperties;
    if (points === undefined) {
        return (
            <div className={cx('panneau-line-chart', styles.chart, className)} style={style}>
                <div className={styles.skeleton}>
                    <Skeleton shape="rect" height="100%" />
                </div>
                <Skeleton width="100%" />
            </div>
        );
    }

    const values = points.map((point) => point.value);
    const scale = niceScale(Math.min(...values, 0), Math.max(...values, 0), domain);
    const tick =
        formatTick ??
        ((value: number) =>
            intl.formatNumber(value, scale.max >= 10_000 ? { notation: 'compact' } : {}));
    const y = (value: number) => 100 - ((value - scale.min) / (scale.max - scale.min)) * 100;
    const plotted: PlotPoint[] = points.map((point, index) => ({
        x: points.length === 1 ? 50 : (index / (points.length - 1)) * 100,
        y: y(point.value),
    }));
    const line = curve === 'linear' ? linearPath(plotted) : monotonePath(plotted);
    const zero = y(Math.min(Math.max(0, scale.min), scale.max));
    const firstPoint = plotted[0];
    const lastIndex = points.length - 1;
    const lastPoint = plotted[lastIndex];
    const maxValue = Math.max(...values);
    const maxIndex = values.indexOf(maxValue);
    const maxPoint = plotted[maxIndex];
    const labelLast = showLast && lastPoint !== undefined;
    const labelMax =
        showMax &&
        maxPoint !== undefined &&
        maxValue > scale.min &&
        !(labelLast && lastPoint.x - maxPoint.x < LABEL_GAP);
    const activePoint = active !== null ? plotted[active] : undefined;
    const activeData = active !== null ? points[active] : undefined;
    const shortLabel = (point: LineChartPoint) => point.shortLabel ?? point.label;
    const describe = (point: LineChartPoint) =>
        intl.formatMessage(messages.chartPoint, { label: point.label, value: format(point.value) });

    // The point under the pointer: the nearest one along the width of the plot
    const point = (event: PointerEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        if (rect.width > 0 && points.length > 0) {
            const ratio = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
            setActive(Math.round(ratio * lastIndex));
        }
    };
    const move = (event: KeyboardEvent<HTMLDivElement>) => {
        const current = active ?? lastIndex;
        const next =
            event.key === 'ArrowLeft' || event.key === 'ArrowDown'
                ? current - 1
                : event.key === 'ArrowRight' || event.key === 'ArrowUp'
                  ? current + 1
                  : event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? lastIndex
                      : null;
        if (next !== null) {
            event.preventDefault();
            setActive(Math.min(Math.max(next, 0), lastIndex));
        }
    };
    const focused = points[active ?? lastIndex];
    const interaction =
        isInteractive && focused !== undefined
            ? {
                  role: 'slider',
                  tabIndex: 0,
                  'aria-label': label,
                  'aria-orientation': 'horizontal' as const,
                  'aria-valuemin': 0,
                  'aria-valuemax': lastIndex,
                  'aria-valuenow': active ?? lastIndex,
                  'aria-valuetext': describe(focused),
                  onPointerMove: point,
                  onPointerDown: point,
                  onPointerLeave: () => setActive(null),
                  onFocus: () => setActive((current) => current ?? lastIndex),
                  onBlur: () => setActive(null),
                  onKeyDown: move,
              }
            : {};

    const widestTick = scale.ticks
        .map(tick)
        .reduce((widest, text) => (text.length > widest.length ? text : widest), '');
    const placement = (index: number): 'above' | 'below' => {
        const previous = points[index - 1];
        const current = points[index];
        return previous !== undefined && current !== undefined && previous.value > current.value
            ? 'below'
            : 'above';
    };
    const valueLabel = (index: number, where: PlotPoint, placedAt: 'above' | 'below') => {
        const data = points[index];
        return data !== undefined ? (
            <span className={styles.valueLabel} data-placement={placedAt} style={positionOf(where)}>
                {format(data.value)}
            </span>
        ) : null;
    };

    return (
        <figure
            className={cx('panneau-line-chart', styles.chart, className)}
            style={style}
            data-axis={showAxis ? '' : undefined}
            data-labels={labelLast || labelMax ? '' : undefined}
        >
            {axisLabel !== undefined ? (
                <div className={styles.axisLabel} aria-hidden="true">
                    {axisLabel}
                </div>
            ) : null}
            <div className={styles.body}>
                {showAxis ? (
                    <div className={styles.scale} aria-hidden="true">
                        {/* The widest graduation gives the width of the column */}
                        <span className={styles.widest}>{widestTick}</span>
                        {scale.ticks.map((value) => (
                            <span
                                key={value}
                                className={styles.tick}
                                style={{ top: `${y(value)}%` }}
                            >
                                {tick(value)}
                            </span>
                        ))}
                    </div>
                ) : null}
                <div className={styles.plot} {...interaction}>
                    <svg
                        className={styles.svg}
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" className={styles.areaTop} />
                                <stop offset="1" className={styles.areaBottom} />
                            </linearGradient>
                        </defs>
                        {showAxis
                            ? scale.ticks.map((value) => (
                                  <line
                                      key={value}
                                      className={styles.grid}
                                      x1="0"
                                      x2="100"
                                      y1={y(value)}
                                      y2={y(value)}
                                  />
                              ))
                            : null}
                        <line className={styles.baseline} x1="0" x2="100" y1={zero} y2={zero} />
                        {firstPoint !== undefined &&
                        lastPoint !== undefined &&
                        points.length > 1 ? (
                            <g className={styles.reveal}>
                                <path
                                    className={styles.area}
                                    fill={`url(#${gradientId})`}
                                    d={`${line} L${lastPoint.x},${zero} L${firstPoint.x},${zero} Z`}
                                />
                                <path className={styles.line} d={line} />
                            </g>
                        ) : null}
                    </svg>
                    {activePoint !== undefined ? (
                        <span
                            className={styles.crosshair}
                            style={{ left: `${activePoint.x}%` }}
                            aria-hidden="true"
                        />
                    ) : null}
                    <div className={styles.marks} aria-hidden="true">
                        {points.length === 1 && firstPoint !== undefined && !labelLast ? (
                            <span className={styles.dot} style={positionOf(firstPoint)} />
                        ) : null}
                        {labelMax && maxPoint !== undefined ? (
                            <span className={styles.dot} style={positionOf(maxPoint)} />
                        ) : null}
                        {labelLast && lastPoint !== undefined ? (
                            <span className={styles.dot} style={positionOf(lastPoint)} />
                        ) : null}
                        {activePoint === undefined && labelMax && maxPoint !== undefined
                            ? valueLabel(maxIndex, maxPoint, 'above')
                            : null}
                        {activePoint === undefined && labelLast && lastPoint !== undefined
                            ? valueLabel(lastIndex, lastPoint, placement(lastIndex))
                            : null}
                        {activePoint !== undefined && activeData !== undefined ? (
                            <>
                                <span
                                    className={cx(styles.dot, styles.activeDot)}
                                    style={positionOf(activePoint)}
                                />
                                <span
                                    className={styles.tooltip}
                                    data-placement={activePoint.y < 30 ? 'below' : 'above'}
                                    style={positionOf(activePoint)}
                                >
                                    <strong className={styles.tooltipValue}>
                                        {format(activeData.value)}
                                    </strong>
                                    <span className={styles.tooltipLabel}>{activeData.label}</span>
                                </span>
                            </>
                        ) : null}
                    </div>
                </div>
                <div className={styles.dates} aria-hidden="true">
                    {axisLabelIndices(points.length, MAX_AXIS_LABELS).map(({ index, minor }) => {
                        const data = points[index];
                        const where = plotted[index];
                        return data !== undefined && where !== undefined ? (
                            <span
                                key={index}
                                className={cx(styles.date, minor && styles.minor)}
                                data-edge={
                                    points.length === 1
                                        ? undefined
                                        : index === 0
                                          ? 'start'
                                          : index === lastIndex
                                            ? 'end'
                                            : undefined
                                }
                                style={{ left: `${where.x}%` }}
                            >
                                {shortLabel(data)}
                            </span>
                        ) : null;
                    })}
                </div>
            </div>
            {/* Hidden in a wrapper: on the table itself, Chrome leaves its caption visible */}
            <div className={styles.visuallyHidden}>
                <table>
                    <caption>{label}</caption>
                    <tbody>
                        {points.map((data, index) => (
                            <tr key={index}>
                                <th scope="row">{data.label}</th>
                                <td>{format(data.value)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </figure>
    );
}

/** The position of a mark on the plot, and its place along the width, to keep its label inside. */
function positionOf(where: PlotPoint): CSSProperties {
    return { left: `${where.x}%`, top: `${where.y}%`, '--_x': where.x } as CSSProperties;
}
