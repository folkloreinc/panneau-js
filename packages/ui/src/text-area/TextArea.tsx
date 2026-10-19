import {
    TextArea as AriaTextArea,
    type TextFieldProps as AriaTextFieldProps,
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
    textAreaClassName?: string;
}

/** A multi-line text input with its label, description and errors. */
export function TextArea({
    label,
    description,
    errors = [],
    placeholder,
    rows = 4,
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    textAreaClassName,
    isRequired,
    ...props
}: TextAreaProps) {
    return (
        <TextField
            {...props}
            isRequired={isRequired}
            isInvalid={errors.length > 0}
            validationBehavior="aria"
            className={cx('panneau-text-area', fieldStyles.field, className)}
        >
            <FieldLabel isRequired={isRequired} className={labelClassName}>
                {label}
            </FieldLabel>
            <AriaTextArea
                placeholder={placeholder}
                rows={rows}
                className={cx(fieldStyles.control, styles.textArea, textAreaClassName)}
            />
            <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
            <FieldErrors errors={errors} className={errorsClassName} />
        </TextField>
    );
}
