import { type CSSProperties, type KeyboardEvent, type PointerEvent, useId, useState } from 'react';

import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { Skeleton } from '../skeleton/Skeleton';
import { chartColors } from '../theme/chartColors';
import { toneClass } from '../theme/toneClass';
import type { Tone } from '../theme/tones';
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

/** A line of a `LineChart` with several. */
export interface LineChartSeries {
    /** What the line is: a column of the table of the chart, and a line of its tooltip. */
    label: string;
    /**
     * Its points, one per date, in the order of those of the first line, whose labels are the
     * dates of the chart. A point missing is 0.
     */
    points: LineChartPoint[];
    /** Its categorical color, from 0. Defaults to its place among the lines. */
    color?: number | undefined;
    /** The solid color of a tone instead. */
    tone?: Tone | undefined;
}

export interface LineChartProps {
    /** What the chart shows: the caption of its table, for assistive technologies. */
    label: string;
    /** The points, in order. Left `undefined` while they load: a skeleton of the plot. */
    points?: LineChartPoint[] | undefined;
    /**
     * Several lines over the same dates, instead of `points`: each on its categorical color or its
     * tone, without values written on them (a legend beside the chart gives their names and
     * totals). The table of the chart has a column per line.
     */
    series?: LineChartSeries[] | undefined;
    /** Stacks the lines of `series`, as areas: the top one is their total. */
    stacked?: boolean | undefined;
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
    points: ownPoints,
    series,
    stacked = false,
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
    const multiple = series !== undefined && series.length > 1;
    const points = series !== undefined ? (series[0]?.points ?? []) : ownPoints;
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

    // The values of each line, aligned on the dates of the first one; stacked, their running totals
    const lines = (series ?? [{ label, points, color, tone: undefined }]).map((line, index) => ({
        label: line.label,
        color: line.color ?? (series !== undefined ? index : color),
        tone: line.tone,
        values: points.map((_, at) => line.points[at]?.value ?? 0),
    }));
    const tops = lines.map((line, index) =>
        line.values.map((value, at) =>
            stacked
                ? lines.slice(0, index + 1).reduce((sum, other) => sum + (other.values[at] ?? 0), 0)
                : value,
        ),
    );
    const drawn = tops.flat();
    const values = points.map((point) => point.value);
    const scale = niceScale(Math.min(...drawn, 0), Math.max(...drawn, 0), domain);
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
    const labelLast = showLast && !multiple && lastPoint !== undefined;
    const labelMax =
        !multiple &&
        showMax &&
        maxPoint !== undefined &&
        maxValue > scale.min &&
        !(labelLast && lastPoint.x - maxPoint.x < LABEL_GAP);
    const activePoint = active !== null ? plotted[active] : undefined;
    const activeData = active !== null ? points[active] : undefined;
    const shortLabel = (point: LineChartPoint) => point.shortLabel ?? point.label;
    const describe = (point: LineChartPoint, index: number) =>
        intl.formatMessage(messages.chartPoint, {
            label: point.label,
            value: multiple
                ? lines
                      .map((line) =>
                          intl.formatMessage(messages.chartPoint, {
                              label: line.label,
                              value: format(line.values[index] ?? 0),
                          }),
                      )
                      .join(', ')
                : format(point.value),
        });
    const plotLine = (line: number[]): PlotPoint[] =>
        line.map((value, index) => ({
            x: points.length === 1 ? 50 : (index / (points.length - 1)) * 100,
            y: y(value),
        }));
    const pathOf = (plot: PlotPoint[]) =>
        curve === 'linear' ? linearPath(plot) : monotonePath(plot);
    const colorStyle = (line: (typeof lines)[number]) =>
        ({ '--_panneau-line-chart-color': chartColors.categorical(line.color) }) as CSSProperties;
    const colorClass = (line: (typeof lines)[number]) =>
        line.tone !== undefined ? cx(styles.toned, toneClass(line.tone)) : undefined;

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
                  'aria-valuetext': describe(focused, active ?? lastIndex),
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
                        {multiple && points.length > 1 ? (
                            <g className={styles.reveal}>
                                {lines.map((line, index) => {
                                    const top = plotLine(tops[index] ?? []);
                                    const below =
                                        index > 0
                                            ? plotLine(tops[index - 1] ?? [])
                                            : top.map((point) => ({ ...point, y: zero }));
                                    const back = pathOf([...below].reverse()).replace(/^M/, 'L');
                                    return (
                                        <g
                                            key={index}
                                            className={colorClass(line)}
                                            style={colorStyle(line)}
                                        >
                                            {stacked ? (
                                                <path
                                                    className={styles.stackArea}
                                                    d={`${pathOf(top)} ${back} Z`}
                                                />
                                            ) : null}
                                            <path className={styles.line} d={pathOf(top)} />
                                        </g>
                                    );
                                })}
                            </g>
                        ) : null}
                        {!multiple &&
                        firstPoint !== undefined &&
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
                        {multiple
                            ? lines.map((line, index) => {
                                  const at = active ?? lastIndex;
                                  const value = tops[index]?.[at];
                                  const where = plotted[at];
                                  return value !== undefined && where !== undefined ? (
                                      <span
                                          key={index}
                                          className={cx(
                                              styles.dot,
                                              active !== null && styles.activeDot,
                                              colorClass(line),
                                          )}
                                          style={{
                                              ...colorStyle(line),
                                              ...positionOf({ x: where.x, y: y(value) }),
                                          }}
                                      />
                                  ) : null;
                              })
                            : null}
                        {!multiple &&
                        points.length === 1 &&
                        firstPoint !== undefined &&
                        !labelLast ? (
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
                        {activePoint !== undefined && activeData !== undefined && multiple ? (
                            <span
                                className={styles.tooltip}
                                data-placement="below"
                                style={positionOf({ x: activePoint.x, y: 0 })}
                            >
                                <span className={styles.tooltipLabel}>{activeData.label}</span>
                                {lines.map((line, index) => (
                                    <span key={index} className={styles.tooltipRow}>
                                        <span
                                            className={cx(styles.swatch, colorClass(line))}
                                            style={colorStyle(line)}
                                        />
                                        {line.label}
                                        <strong className={styles.tooltipValue}>
                                            {format(line.values[active ?? lastIndex] ?? 0)}
                                        </strong>
                                    </span>
                                ))}
                            </span>
                        ) : null}
                        {activePoint !== undefined && activeData !== undefined && !multiple ? (
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
                    {multiple ? (
                        <thead>
                            <tr>
                                <th scope="col">{intl.formatMessage(messages.chartDate)}</th>
                                {lines.map((line, index) => (
                                    <th key={index} scope="col">
                                        {line.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    ) : null}
                    <tbody>
                        {points.map((data, index) => (
                            <tr key={index}>
                                <th scope="row">{data.label}</th>
                                {multiple ? (
                                    lines.map((line, at) => (
                                        <td key={at}>{format(line.values[index] ?? 0)}</td>
                                    ))
                                ) : (
                                    <td>{format(data.value)}</td>
                                )}
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
