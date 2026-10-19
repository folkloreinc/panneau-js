import type { ReactNode } from 'react';
import {
    type TextFieldProps as AriaTextFieldProps,
    Group,
    Input,
    TextField,
} from 'react-aria-components';

import {
    type FieldChromeProps,
    FieldDescription,
    FieldErrors,
    FieldLabel,
    fieldStyles as styles,
} from '../field/FieldParts';
import { cx } from '../utils/cx';

export interface TextInputProps
    extends
        Omit<
            AriaTextFieldProps,
            'className' | 'style' | 'children' | 'isInvalid' | 'validate' | 'type'
        >,
        FieldChromeProps {
    type?: 'text' | 'email' | 'url' | 'tel' | 'password' | 'search';
    placeholder?: string;
    /** Content before the text, inside the control: a unit, a URL prefix, an icon. */
    prefix?: ReactNode;
    /** Content after the text, inside the control. */
    suffix?: ReactNode;
    /** Class name of the control (the box around the text). */
    controlClassName?: string;
    inputClassName?: string;
}

/** A single-line text input with its label, description and errors. */
export function TextInput({
    label,
    description,
    errors = [],
    placeholder,
    prefix,
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
}: TextInputProps) {
    const invalid = errors.length > 0;
    const adorned = prefix !== undefined || suffix !== undefined;
    return (
        <TextField
            data-panneau="text-input"
            {...props}
            isRequired={isRequired}
            isReadOnly={isReadOnly}
            isInvalid={invalid}
            validationBehavior="aria"
            className={cx(styles.field, className)}
        >
            <FieldLabel isRequired={isRequired} className={labelClassName}>
                {label}
            </FieldLabel>
            {adorned ? (
                <Group
                    className={cx(styles.control, controlClassName)}
                    data-invalid={invalid || undefined}
                    data-readonly={isReadOnly || undefined}
                    isDisabled={props.isDisabled}
                >
                    {prefix !== undefined ? (
                        <span className={styles.adornment}>{prefix}</span>
                    ) : null}
                    <Input placeholder={placeholder} className={cx(styles.bare, inputClassName)} />
                    {suffix !== undefined ? (
                        <span className={styles.adornment}>{suffix}</span>
                    ) : null}
                </Group>
            ) : (
                <Input
                    placeholder={placeholder}
                    className={cx(styles.control, controlClassName, inputClassName)}
                />
            )}
            <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
            <FieldErrors errors={errors} className={errorsClassName} />
        </TextField>
    );
}
