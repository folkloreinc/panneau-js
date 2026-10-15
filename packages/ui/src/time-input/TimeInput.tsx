import {
    DateInput,
    DateSegment,
    TimeField,
    type TimeFieldProps,
    type TimeValue,
} from 'react-aria-components';

import datePickerStyles from '../date-picker/DatePicker.module.css';
import {
    type FieldChromeProps,
    FieldDescription,
    FieldErrors,
    FieldLabel,
    fieldStyles,
} from '../field/FieldParts';
import { cx } from '../utils/cx';

export interface TimeInputProps
    extends
        Omit<
            TimeFieldProps<TimeValue>,
            'className' | 'style' | 'children' | 'isInvalid' | 'validate'
        >,
        FieldChromeProps {
    controlClassName?: string;
}

/** A time of day, typed segment by segment in the format of the locale. */
export function TimeInput({
    label,
    description,
    errors = [],
    isRequired,
    isReadOnly,
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    controlClassName,
    ...props
}: TimeInputProps) {
    return (
        <TimeField
            {...props}
            isRequired={isRequired}
            isReadOnly={isReadOnly}
            isInvalid={errors.length > 0}
            validationBehavior="aria"
            className={cx(fieldStyles.field, className)}
        >
            <FieldLabel isRequired={isRequired} className={labelClassName}>
                {label}
            </FieldLabel>
            <DateInput
                className={cx(fieldStyles.control, datePickerStyles.input, controlClassName)}
                data-readonly={isReadOnly || undefined}
            >
                {(segment) => (
                    <DateSegment segment={segment} className={datePickerStyles.segment} />
                )}
            </DateInput>
            <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
            <FieldErrors errors={errors} className={errorsClassName} />
        </TimeField>
    );
}
