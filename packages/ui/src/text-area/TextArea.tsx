import type { ReactNode } from 'react';
import {
    TextArea as AriaTextArea,
    type TextFieldProps as AriaTextFieldProps,
    Group,
    TextField,
} from 'react-aria-components';

import {
    type FieldChromeProps,
    FieldDescription,
    FieldErrors,
    FieldLabel,
    fieldStyles,
} from '../field/FieldParts';
import { cx } from '../utils/cx';
import styles from './TextArea.module.css';

export interface TextAreaProps
    extends
        Omit<AriaTextFieldProps, 'className' | 'style' | 'children' | 'isInvalid' | 'validate'>,
        FieldChromeProps {
    placeholder?: string;
    /** Visible lines of text. Defaults to 4. */
    rows?: number;
    /**
     * Content inside the box, above the text: a hint, small buttons (`IconButton` or `Button` with
     * `size="sm"`).
     */
    header?: ReactNode;
    /** Content inside the box, under the text: a character count, small buttons. */
    footer?: ReactNode;
    /** Class name of the box, with a header or a footer. */
    controlClassName?: string;
    textAreaClassName?: string;
}

/** A multi-line text input with its label, description and errors. */
export function TextArea({
    label,
    description,
    errors = [],
    placeholder,
    rows = 4,
    header,
    footer,
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    controlClassName,
    textAreaClassName,
    isRequired,
    isReadOnly,
    ...props
}: TextAreaProps) {
    const invalid = errors.length > 0;
    const hasHeader = header !== undefined && header !== null;
    const hasFooter = footer !== undefined && footer !== null;
    return (
        <TextField
            {...props}
            isRequired={isRequired}
            isReadOnly={isReadOnly}
            isInvalid={invalid}
            validationBehavior="aria"
            className={cx('panneau-text-area', fieldStyles.field, className)}
        >
            <FieldLabel isRequired={isRequired} className={labelClassName}>
                {label}
            </FieldLabel>
            {hasHeader || hasFooter ? (
                <Group
                    className={cx(fieldStyles.control, styles.box, controlClassName)}
                    data-invalid={invalid || undefined}
                    isReadOnly={isReadOnly}
                    isDisabled={props.isDisabled}
                >
                    {hasHeader ? <div className={styles.header}>{header}</div> : null}
                    <AriaTextArea
                        placeholder={placeholder}
                        rows={rows}
                        className={cx(fieldStyles.bare, styles.text, textAreaClassName)}
                    />
                    {hasFooter ? <div className={styles.footer}>{footer}</div> : null}
                </Group>
            ) : (
                <AriaTextArea
                    placeholder={placeholder}
                    rows={rows}
                    className={cx(
                        fieldStyles.control,
                        styles.control,
                        controlClassName,
                        textAreaClassName,
                    )}
                />
            )}
            <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
            <FieldErrors errors={errors} className={errorsClassName} />
        </TextField>
    );
}
