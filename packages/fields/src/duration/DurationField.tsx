import { Fieldset, NumberInput, usePanneauIntl } from '@panneau/ui';

import { getFieldProps, getSetting, isNumber, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import styles from './DurationField.module.css';

export interface DurationFieldProps extends FieldProps<number> {
    /** `seconds` (the default) shows hours, minutes and seconds; `minutes` hides the seconds. */
    precision?: 'seconds' | 'minutes';
}

/** Hours, minutes and seconds of a number of seconds. */
export function splitDuration(seconds: number): {
    hours: number;
    minutes: number;
    seconds: number;
} {
    const total = Math.max(0, Math.round(seconds));
    return {
        hours: Math.floor(total / 3600),
        minutes: Math.floor((total % 3600) / 60),
        seconds: total % 60,
    };
}

/**
 * A duration with its units, without the empty ones: `1 h 5 min 30 s`, `3 min`. With a precision
 * of minutes, the seconds are rounded away.
 */
export function formatDuration(
    seconds: number,
    { precision = 'seconds' }: { precision?: 'seconds' | 'minutes' } = {},
): string {
    const parts = splitDuration(precision === 'minutes' ? Math.round(seconds / 60) * 60 : seconds);
    const shown = [
        parts.hours > 0 ? `${parts.hours} h` : null,
        parts.minutes > 0 ? `${parts.minutes} min` : null,
        precision === 'seconds' && parts.seconds > 0 ? `${parts.seconds} s` : null,
    ].filter((part) => part !== null);
    return shown.length > 0 ? shown.join(' ') : precision === 'minutes' ? '0 min' : '0 s';
}

/**
 * A duration, in seconds, typed in hours, minutes and seconds. It is `null` while every part is
 * empty.
 */
export function DurationField({
    value,
    onChange,
    onBlur,
    precision = 'seconds',
    label,
    description,
    errors,
    disabled,
    readOnly,
    required,
    name,
    className,
}: DurationFieldProps) {
    const intl = usePanneauIntl();
    const parts = value !== null && value !== undefined ? splitDuration(value) : null;
    const change = (part: 'hours' | 'minutes' | 'seconds', next: number | null) => {
        const updated = { ...(parts ?? { hours: 0, minutes: 0, seconds: 0 }), [part]: next ?? 0 };
        const total = updated.hours * 3600 + updated.minutes * 60 + updated.seconds;
        // Clearing the last part that had a value empties the field
        onChange?.(total === 0 && next === null ? null : total);
    };
    const input = (part: 'hours' | 'minutes' | 'seconds') => (
        <NumberInput
            aria-label={intl.formatMessage(messages[part])}
            value={parts?.[part] ?? null}
            onChange={(next) => change(part, next)}
            onBlur={() => onBlur?.()}
            minValue={0}
            {...(part !== 'hours' ? { maxValue: 59 } : {})}
            formatOptions={{ maximumFractionDigits: 0 }}
            suffix={intl.formatMessage(messages[`${part}Unit`])}
            isDisabled={disabled}
            isReadOnly={readOnly}
            {...(name !== undefined ? { name: `${name}[${part}]` } : {})}
            className={styles.part}
        />
    );
    return (
        <Fieldset
            legend={label}
            description={description}
            errors={errors}
            isRequired={required}
            isDisabled={disabled}
            className={className}
        >
            <div className={styles.parts}>
                {input('hours')}
                {input('minutes')}
                {precision === 'seconds' ? input('seconds') : null}
            </div>
        </Fieldset>
    );
}

/** The `duration` type: a number of seconds, with setting `precision` (`seconds` or `minutes`). */
export function DurationFieldEntry(props: FieldEntryProps) {
    const precision = getSetting(props.field, 'precision', isString);
    const { placeholder: _placeholder, ...fieldProps } = getFieldProps(props);
    return (
        <DurationField
            {...fieldProps}
            value={isNumber(props.value) ? props.value : null}
            onChange={props.onChange}
            {...(precision === 'minutes' || precision === 'seconds' ? { precision } : {})}
        />
    );
}
