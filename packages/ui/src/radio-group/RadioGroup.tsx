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
    options: readonly SelectOption[];
    value?: OptionValue | null;
    onChange?: (value: OptionValue) => void;
    radioClassName?: string;
}

/** A set of options where one can be picked, all visible at once. */
export function RadioGroup({
    options,
    value,
    onChange,
    label,
    description,
    errors = [],
    orientation = 'vertical',
    isRequired,
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    radioClassName,
    ...props
}: RadioGroupProps) {
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
                orientation === 'horizontal' && styles.horizontal,
                className,
            )}
        >
            <FieldLabel isRequired={isRequired} className={labelClassName}>
                {label}
            </FieldLabel>
            <div className={styles.options}>
                {options.map((option, position) => (
                    <Radio
                        key={position}
                        value={String(position)}
                        isDisabled={option.disabled}
                        className={cx('panneau-radio', styles.radio, radioClassName)}
                    >
                        <span className={styles.circle} aria-hidden="true" />
                        <span className={styles.text}>
                            <span>{option.label}</span>
                            {option.description !== undefined ? (
                                <span className={styles.description}>{option.description}</span>
                            ) : null}
                        </span>
                    </Radio>
                ))}
            </div>
            <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
            <FieldErrors errors={errors} className={errorsClassName} />
        </AriaRadioGroup>
    );
}
