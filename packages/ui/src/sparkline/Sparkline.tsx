import type { CSSProperties } from 'react';

import { monotonePath } from '../line-chart/geometry';
import { Skeleton } from '../skeleton/Skeleton';
import { chartColors } from '../theme/chartColors';
import { toneClass } from '../theme/toneClass';
import type { Tone } from '../theme/tones';
import { cx } from '../utils/cx';
import styles from './Sparkline.module.css';

export interface SparklineProps {
    /** The values, in order: a day, a week, a month each. Left `undefined` while they load. */
    values?: readonly number[] | undefined;
    /**
     * What the line shows, said to assistive technologies as an image: `Emails per day, up from
     * 12 to 40`. Without it, the line is decorative: the numbers it goes with say its values.
     */
    label?: string | undefined;
    /** The categorical color of the line, from 0. Defaults to the first. */
    color?: number | undefined;
    /** The color of a tone instead. */
    tone?: Tone | undefined;
    className?: string | undefined;
}

/**
 * A small line of values, without a scale or labels: the trend beside a number, in a card or a
 * row of a table. From its lowest value to its highest, so that the trend shows whatever the size
 * of the numbers (the number beside it says how large they are), with a dot on the last one. Equal
 * values are a flat line: at the bottom at 0, in the middle otherwise.
 */
export function Sparkline({ values, label, color = 0, tone, className }: SparklineProps) {
    const style = { '--_panneau-sparkline-color': chartColors.categorical(color) } as CSSProperties;
    const classes = cx(
        'panneau-sparkline',
        styles.sparkline,
        tone !== undefined && styles.toned,
        tone !== undefined && toneClass(tone),
        className,
    );
    if (values === undefined) {
        return (
            <div className={classes} style={style}>
                <Skeleton shape="rect" height="100%" />
            </div>
        );
    }
    const low = Math.min(...values);
    const high = Math.max(...values);
    const range = high - low;
    const flat = values.every((value) => value === 0) ? 100 : 50;
    const points = values.map((value, index) => ({
        x: values.length === 1 ? 100 : (index / (values.length - 1)) * 100,
        y: range > 0 ? 100 - ((value - low) / range) * 100 : flat,
    }));
    const first = points[0];
    const last = points.at(-1);
    const line =
        first !== undefined && points.length === 1
            ? `M0,${first.y} L100,${first.y}`
            : monotonePath(points);
    return (
        <div
            className={classes}
            style={style}
            {...(label !== undefined
                ? { role: 'img', 'aria-label': label }
                : { 'aria-hidden': true })}
        >
            {last !== undefined ? (
                <>
                    <svg
                        className={styles.svg}
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        focusable="false"
                        aria-hidden="true"
                    >
                        {points.length > 1 && first !== undefined ? (
                            <path
                                className={styles.area}
                                d={`${line} L${last.x},100 L${first.x},100 Z`}
                            />
                        ) : null}
                        <path className={styles.line} d={line} />
                    </svg>
                    <span
                        className={styles.dot}
                        style={{ left: `${last.x}%`, top: `${last.y}%` }}
                        aria-hidden="true"
                    />
                </>
            ) : null}
        </div>
    );
}
