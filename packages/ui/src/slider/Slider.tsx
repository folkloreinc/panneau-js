import { type ReactNode, useId } from 'react';
import {
    Slider as AriaSlider,
    type SliderProps as AriaSliderProps,
    SliderOutput,
    SliderThumb,
    SliderTrack,
} from 'react-aria-components';

import { type FieldChromeProps, FieldLabel, fieldStyles } from '../field/FieldParts';
import { cx } from '../utils/cx';
import styles from './Slider.module.css';

export interface SliderProps
    extends
        Omit<
            AriaSliderProps<number>,
            'className' | 'style' | 'children' | 'value' | 'defaultValue' | 'onChange'
        >,
        FieldChromeProps {
    /** The number, or `null` until the slider is moved: the thumb then rests at the start. */
    value?: number | null;
    defaultValue?: number | null;
    onChange?: (value: number) => void;
    /** Content after the value: a unit. */
    suffix?: ReactNode;
    /** Name of the input, in a form. */
    name?: string;
    isRequired?: boolean;
}

/**
 * A number between `minValue` and `maxValue` (0 and 100 by default), picked on a track by mouse,
 * touch or arrow keys. Its value shows next to its label, formatted for the locale.
 */
export function Slider({
    label,
    description,
    errors = [],
    value,
    defaultValue,
    onChange,
    suffix,
    name,
    isRequired,
    minValue = 0,
    maxValue = 100,
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    ...props
}: SliderProps) {
    const id = useId();
    const invalid = errors.length > 0;
    const describedBy = [
        description !== undefined && description !== null ? `${id}-description` : null,
        invalid ? `${id}-errors` : null,
    ]
        .filter((part) => part !== null)
        .join(' ');
    const empty = value === null || (value === undefined && defaultValue == null);
    return (
        <AriaSlider
            {...props}
            minValue={minValue}
            maxValue={maxValue}
            {...(value !== undefined ? { value: value ?? minValue } : {})}
            {...(defaultValue !== undefined ? { defaultValue: defaultValue ?? minValue } : {})}
            {...(onChange !== undefined ? { onChange } : {})}
            className={cx('panneau-slider', fieldStyles.field, styles.slider, className)}
            data-invalid={invalid || undefined}
            data-empty={empty || undefined}
        >
            <div className={styles.header}>
                <FieldLabel isRequired={isRequired} className={labelClassName}>
                    {label}
                </FieldLabel>
                <SliderOutput className={styles.output}>
                    {({ state }) =>
                        empty ? (
                            '—'
                        ) : (
                            <>
                                {state.getThumbValueLabel(0)}
                                {suffix !== undefined ? <> {suffix}</> : null}
                            </>
                        )
                    }
                </SliderOutput>
            </div>
            <SliderTrack className={styles.track}>
                {({ state }) => (
                    <>
                        <div
                            className={styles.fill}
                            style={{ width: empty ? 0 : `${state.getThumbPercent(0) * 100}%` }}
                        />
                        <SliderThumb
                            className={styles.thumb}
                            {...(name !== undefined ? { name } : {})}
                            {...(describedBy !== '' ? { 'aria-describedby': describedBy } : {})}
                        />
                    </>
                )}
            </SliderTrack>
            {description !== undefined && description !== null ? (
                <div
                    id={`${id}-description`}
                    className={cx(fieldStyles.description, descriptionClassName)}
                >
                    {description}
                </div>
            ) : null}
            {invalid ? (
                <div id={`${id}-errors`} className={cx(fieldStyles.errors, errorsClassName)}>
                    {errors.map((error, index) => (
                        <span key={index} className={fieldStyles.error}>
                            {error}
                        </span>
                    ))}
                </div>
            ) : null}
        </AriaSlider>
    );
}
