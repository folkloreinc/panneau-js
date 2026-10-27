import type { CSSProperties, ReactNode } from 'react';
import {
    RadioGroup as AriaRadioGroup,
    type RadioGroupProps as AriaRadioGroupProps,
    Radio,
} from 'react-aria-components';

import {
    type FieldChromeProps,
    FieldDescription,
    FieldErrors,
    FieldLabel,
    fieldStyles,
} from '../field/FieldParts';
import type { OptionValue, SelectOption } from '../select/Select';
import { cx } from '../utils/cx';
import styles from './RadioGroup.module.css';

/** An option of a `RadioGroup`: a `SelectOption`, with an optional leading media. */
export interface RadioGroupOption extends SelectOption {
    /** Leading media, such as an avatar or an image, between the radio and the label. */
    media?: ReactNode;
}

/** How a `RadioGroup` shows its options: a list of radios, or bordered cards in a grid. */
export type RadioGroupAppearance = 'list' | 'cards';

export interface RadioGroupProps
    extends
        Omit<
            AriaRadioGroupProps,
            | 'className'
            | 'style'
            | 'children'
            | 'isInvalid'
            | 'validate'
            | 'value'
            | 'defaultValue'
            | 'onChange'
        >,
        FieldChromeProps {
    options: readonly RadioGroupOption[];
    value?: OptionValue | null;
    onChange?: (value: OptionValue) => void;
    /**
     * `list` (default) shows the options as radios, one under the other or side by side with
     * `orientation="horizontal"`. `cards` shows them as bordered cards in a grid of `columns`, which
     * becomes a single column in a narrow container. The selected card has a stronger border.
     */
    appearance?: RadioGroupAppearance;
    /** Columns of cards, with `appearance="cards"`. Defaults to 2. */
    columns?: number;
    radioClassName?: string;
}

/**
 * A set of options where one can be picked, all visible at once, as a list of radios or as cards
 * (`appearance="cards"`). Arrow keys move between options in both appearances.
 */
export function RadioGroup({
    options,
    value,
    onChange,
    label,
    description,
    errors = [],
    orientation = 'vertical',
    appearance = 'list',
    columns = 2,
    isRequired,
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    radioClassName,
    ...props
}: RadioGroupProps) {
    const radios = options.map((option, position) => (
        <Radio
            key={position}
            value={String(position)}
            isDisabled={option.disabled}
            className={cx(
                'panneau-radio',
                styles.radio,
                appearance === 'cards' && styles.card,
                radioClassName,
            )}
        >
            <span className={styles.circle} aria-hidden="true" />
            {option.media !== undefined && option.media !== null ? (
                <span className={styles.media}>{option.media}</span>
            ) : null}
            <span className={styles.text}>
                <span className={styles.optionLabel}>{option.label}</span>
                {option.description !== undefined ? (
                    <span className={styles.description}>{option.description}</span>
                ) : null}
            </span>
        </Radio>
    ));
    const index = value === undefined ? undefined : options.findIndex((o) => o.value === value);
    return (
        <AriaRadioGroup
            {...props}
            orientation={orientation}
            isRequired={isRequired}
            value={index === undefined ? undefined : index === -1 ? null : String(index)}
            onChange={(key) => {
                const option = options[Number(key)];
                if (option !== undefined) {
                    onChange?.(option.value);
                }
            }}
            isInvalid={errors.length > 0}
            validationBehavior="aria"
            className={cx(
                'panneau-radio-group',
                fieldStyles.field,
                appearance === 'cards'
                    ? styles.cards
                    : orientation === 'horizontal' && styles.horizontal,
                className,
            )}
        >
            <FieldLabel isRequired={isRequired} className={labelClassName}>
                {label}
            </FieldLabel>
            {appearance === 'cards' ? (
                <div className={styles.grid}>
                    <div
                        className={styles.options}
                        style={
                            {
                                '--_panneau-radio-group-columns': String(
                                    Math.max(1, Math.floor(columns)),
                                ),
                            } as CSSProperties
                        }
                    >
                        {radios}
                    </div>
                </div>
            ) : (
                <div className={styles.options}>{radios}</div>
            )}
            <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
            <FieldErrors errors={errors} className={errorsClassName} />
        </AriaRadioGroup>
    );
}
