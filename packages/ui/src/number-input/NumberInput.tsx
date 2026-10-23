import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    type NumberFieldProps as AriaNumberFieldProps,
    Button,
    Group,
    Input,
    NumberField,
} from 'react-aria-components';

import {
    type FieldChromeProps,
    FieldDescription,
    FieldErrors,
    FieldLabel,
    fieldStyles,
} from '../field/FieldParts';
import { Icon } from '../icon/Icon';
import { cx } from '../utils/cx';
import styles from './NumberInput.module.css';

export interface NumberInputProps
    extends
        Omit<
            AriaNumberFieldProps,
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
    /** The number, or `null` when empty. */
    value?: number | null;
    defaultValue?: number | null;
    /** Called with the number, or `null` when the input is cleared. */
    onChange?: (value: number | null) => void;
    placeholder?: string;
    /** Content after the number, inside the control: a unit. */
    suffix?: ReactNode;
    controlClassName?: string;
    inputClassName?: string;
}

function toAria(value: number | null | undefined): number | undefined {
    return value === null ? Number.NaN : value;
}

/**
 * A number input, formatted for the locale, with steppers and arrow keys. An empty input is
 * `null`, not `NaN`.
 */
export function NumberInput({
    label,
    description,
    errors = [],
    value,
    defaultValue,
    onChange,
    placeholder,
    suffix,
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    controlClassName,
    inputClassName,
    isRequired,
    isReadOnly,
    ...props
}: NumberInputProps) {
    const invalid = errors.length > 0;
    return (
        <NumberField
            {...props}
            value={toAria(value)}
            defaultValue={toAria(defaultValue)}
            onChange={(next) => onChange?.(Number.isNaN(next) ? null : next)}
            isRequired={isRequired}
            isReadOnly={isReadOnly}
            isInvalid={invalid}
            validationBehavior="aria"
            className={cx('panneau-number-input', fieldStyles.field, className)}
        >
            <FieldLabel isRequired={isRequired} className={labelClassName}>
                {label}
            </FieldLabel>
            <Group
                className={cx(fieldStyles.control, styles.control, controlClassName)}
                data-invalid={invalid || undefined}
                data-readonly={isReadOnly || undefined}
            >
                <Input
                    placeholder={placeholder}
                    className={cx(fieldStyles.bare, styles.input, inputClassName)}
                />
                {suffix !== undefined ? (
                    <span className={cx(fieldStyles.adornment, styles.suffix)}>{suffix}</span>
                ) : null}
                {isReadOnly !== true ? (
                    <span className={styles.steppers}>
                        <Button slot="increment" className={styles.stepper}>
                            <Icon icon={ChevronUp} size="xs" />
                        </Button>
                        <Button slot="decrement" className={styles.stepper}>
                            <Icon icon={ChevronDown} size="xs" />
                        </Button>
                    </span>
                ) : null}
            </Group>
            <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
            <FieldErrors errors={errors} className={errorsClassName} />
        </NumberField>
    );
}
