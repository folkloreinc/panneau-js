import type { Field } from '@panneau/protocol';
import { DURATION_UNITS, type DurationUnit } from '@panneau/protocol/runtime';
import { Fieldset, NumberInput, usePanneauIntl } from '@panneau/ui';

import { getFieldProps, getSetting, isNumber } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import styles from './DurationField.module.css';

export type { DurationUnit };

/**
 * The unit of a duration's value and the parts that show it (decision 0056). Every unit is
 * `seconds`, `minutes`, `hours` or `days`, and a day is 24 hours.
 */
export interface DurationUnits {
    /** The unit of the value, a whole number: `seconds` by default. */
    unit?: DurationUnit;
    /** The smallest part shown. Defaults to `unit`; a precision finer than `unit` is raised to it. */
    precision?: DurationUnit;
    /**
     * The largest part shown, which has no upper bound. Defaults to the larger of `hours` and
     * `precision`; a largest unit smaller than `precision` is raised to it.
     */
    largestUnit?: DurationUnit;
}

/** The parts of a duration, from its largest unit to its precision. */
export type DurationParts = Partial<Record<DurationUnit, number>>;

/** Options of `formatDuration()`. */
export interface FormatDurationOptions extends DurationUnits {
    /** The abbreviations of the units: `d`, `h`, `min` and `s` by default. */
    labels?: Partial<Record<DurationUnit, string>>;
}

const SECONDS: Readonly<Record<DurationUnit, number>> = {
    seconds: 1,
    minutes: 60,
    hours: 3600,
    days: 86_400,
};

const LABELS: Readonly<Record<DurationUnit, string>> = {
    days: 'd',
    hours: 'h',
    minutes: 'min',
    seconds: 's',
};

const rank = (unit: DurationUnit) => DURATION_UNITS.indexOf(unit);
const larger = (a: DurationUnit, b: DurationUnit) => (rank(a) >= rank(b) ? a : b);

/** Whether a value is a unit of a duration: `seconds`, `minutes`, `hours` or `days`. */
export function isDurationUnit(value: unknown): value is DurationUnit {
    return typeof value === 'string' && (DURATION_UNITS as readonly string[]).includes(value);
}

/**
 * The units of a duration with their defaults: `seconds` for the value, a precision of the unit
 * of the value, and a largest unit of `hours` or the precision, whichever is larger.
 */
export function resolveDurationUnits({
    unit = 'seconds',
    precision,
    largestUnit,
}: DurationUnits = {}): Required<DurationUnits> {
    const smallest = larger(precision ?? unit, unit);
    return { unit, precision: smallest, largestUnit: larger(largestUnit ?? 'hours', smallest) };
}

/** The units of a `duration` field, from its settings `unit`, `precision` and `largestUnit`. */
export function getDurationUnits(field: Field): DurationUnits {
    const unit = getSetting(field, 'unit', isDurationUnit);
    const precision = getSetting(field, 'precision', isDurationUnit);
    const largestUnit = getSetting(field, 'largestUnit', isDurationUnit);
    return {
        ...(unit !== undefined ? { unit } : {}),
        ...(precision !== undefined ? { precision } : {}),
        ...(largestUnit !== undefined ? { largestUnit } : {}),
    };
}

/** The units from the largest to the smallest, both included. */
function unitsBetween(largest: DurationUnit, smallest: DurationUnit): DurationUnit[] {
    return DURATION_UNITS.slice(rank(smallest), rank(largest) + 1).reverse();
}

/**
 * The parts of a duration, from its largest unit to its precision: hours, minutes and seconds of
 * a number of seconds by default. The largest part takes what the larger units would have held
 * (`48` hours for 2 days), and what is finer than the precision is dropped.
 */
export function splitDuration(seconds: number): { hours: number; minutes: number; seconds: number };
/** The parts of a duration in `units.unit`, from `units.largestUnit` to `units.precision`. */
export function splitDuration(value: number, units: DurationUnits): DurationParts;
export function splitDuration(value: number, units: DurationUnits = {}): DurationParts {
    const { unit, precision, largestUnit } = resolveDurationUnits(units);
    let rest = Math.max(0, Math.round(value)) * SECONDS[unit];
    const parts: DurationParts = {};
    for (const part of unitsBetween(largestUnit, precision)) {
        const count = Math.floor(rest / SECONDS[part]);
        parts[part] = count;
        rest -= count * SECONDS[part];
    }
    return parts;
}

/**
 * A duration with its units, without the empty ones: `1 h 5 min 30 s`, `3 min`, `2 d 4 h`. The
 * value is in `unit` (seconds by default), and is rounded to the precision.
 */
export function formatDuration(value: number, options: FormatDurationOptions = {}): string {
    const units = resolveDurationUnits(options);
    const labels = { ...LABELS, ...options.labels };
    const step = SECONDS[units.precision] / SECONDS[units.unit];
    const parts = splitDuration(Math.round(value / step) * step, units);
    const shown = unitsBetween(units.largestUnit, units.precision).flatMap((part) => {
        const count = parts[part] ?? 0;
        return count > 0 ? [`${String(count)} ${labels[part]}`] : [];
    });
    return shown.length > 0 ? shown.join(' ') : `0 ${labels[units.precision]}`;
}

/** Props of `DurationField`: those of every field, and the units of the duration. */
export interface DurationFieldProps extends FieldProps<number>, DurationUnits {}

/**
 * A duration, a whole number of `unit` (seconds by default), typed in parts from `largestUnit`
 * to `precision`: hours, minutes and seconds by default. The largest part has no upper bound.
 * It is `null` while every part is empty.
 */
export function DurationField({
    value,
    onChange,
    onBlur,
    unit: unitProp,
    precision: precisionProp,
    largestUnit: largestUnitProp,
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
    const { unit, precision, largestUnit } = resolveDurationUnits({
        ...(unitProp !== undefined ? { unit: unitProp } : {}),
        ...(precisionProp !== undefined ? { precision: precisionProp } : {}),
        ...(largestUnitProp !== undefined ? { largestUnit: largestUnitProp } : {}),
    });
    // Every part down to the unit of the value: parts finer than the precision are kept as they
    // are when another part changes.
    const all = unitsBetween(largestUnit, unit);
    const parts =
        value !== null && value !== undefined
            ? splitDuration(value, { unit, precision: unit, largestUnit })
            : null;
    const change = (part: DurationUnit, next: number | null) => {
        const updated: DurationParts = { ...parts, [part]: next ?? 0 };
        const total = all.reduce(
            (sum, current) => sum + ((updated[current] ?? 0) * SECONDS[current]) / SECONDS[unit],
            0,
        );
        // Clearing the last part that had a value empties the field
        onChange?.(total === 0 && next === null ? null : total);
    };
    const input = (part: DurationUnit) => {
        const above = DURATION_UNITS[rank(part) + 1];
        return (
            <NumberInput
                key={part}
                aria-label={intl.formatMessage(messages[part])}
                value={parts?.[part] ?? null}
                onChange={(next) => change(part, next)}
                onBlur={() => onBlur?.()}
                minValue={0}
                // The largest part has no upper bound: 90 minutes, or 48 hours without days
                {...(part !== largestUnit && above !== undefined
                    ? { maxValue: SECONDS[above] / SECONDS[part] - 1 }
                    : {})}
                formatOptions={{ maximumFractionDigits: 0 }}
                suffix={intl.formatMessage(messages[`${part}Unit`])}
                isDisabled={disabled}
                isReadOnly={readOnly}
                {...(name !== undefined ? { name: `${name}[${part}]` } : {})}
                className={styles.part}
            />
        );
    };
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
                {unitsBetween(largestUnit, precision).map((part) => input(part))}
            </div>
        </Fieldset>
    );
}

/**
 * The `duration` type: a whole number of `settings.unit`, with settings `precision` and
 * `largestUnit` for the parts its input shows.
 */
export function DurationFieldEntry(props: FieldEntryProps) {
    const { placeholder: _placeholder, ...fieldProps } = getFieldProps(props);
    return (
        <DurationField
            {...fieldProps}
            {...getDurationUnits(props.field)}
            value={isNumber(props.value) ? props.value : null}
            onChange={props.onChange}
        />
    );
}
