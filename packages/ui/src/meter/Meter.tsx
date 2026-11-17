import type { CSSProperties } from 'react';
import { Meter as AriaMeter } from 'react-aria-components';

import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { chartColors } from '../theme/chartColors';
import { toneClass } from '../theme/toneClass';
import type { Tone } from '../theme/tones';
import { cx } from '../utils/cx';
import styles from './Meter.module.css';

export interface MeterProps {
    /** The value: how much of the target is reached. */
    value: number;
    /** The target, above 0: a budget, a quota. The bar is full at the target, and past it. */
    target: number;
    /** What the meter measures. Without it, or `aria-labelledby`, it is named "Target". */
    label?: string;
    /** The id of the element that names the meter, instead of `label`. */
    'aria-labelledby'?: string;
    /**
     * Colors the fill, when the value calls for attention (past the target): the solid color of
     * the tone. The first categorical chart color by default.
     */
    tone?: Tone | undefined;
    /** Formats the value and the target, in what assistive technologies read: `1,250 of 1,000`. */
    formatValue?: (value: number) => string;
    className?: string;
}

/**
 * A value against a target, as a bar that fills up to it: a budget spent, a quota used. Assistive
 * technologies read it as a meter, with the value and the target ("1,250 of 1,000"), even past the
 * target, where the bar stays full.
 */
export function Meter({
    value,
    target,
    label,
    'aria-labelledby': labelledBy,
    tone,
    formatValue,
    className,
}: MeterProps) {
    const intl = usePanneauIntl();
    const format = formatValue ?? ((number: number) => intl.formatNumber(number));
    const max = target > 0 ? target : 1;
    const clamped = Math.min(Math.max(value, 0), max);
    const style = { '--_panneau-meter-color': chartColors.categorical(0) } as CSSProperties;
    return (
        <AriaMeter
            value={clamped}
            minValue={0}
            maxValue={max}
            valueLabel={intl.formatMessage(messages.meterValue, {
                value: format(value),
                target: format(target),
            })}
            {...(labelledBy !== undefined
                ? { 'aria-labelledby': labelledBy }
                : { 'aria-label': label ?? intl.formatMessage(messages.meterTarget) })}
            className={cx(
                'panneau-meter',
                styles.meter,
                tone !== undefined && styles.toned,
                tone !== undefined && toneClass(tone),
                className,
            )}
            style={style}
        >
            {({ percentage }) => (
                <div className={styles.track}>
                    <div className={styles.fill} style={{ width: `${percentage}%` }} />
                </div>
            )}
        </AriaMeter>
    );
}
