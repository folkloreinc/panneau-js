import { Fragment, type ReactNode } from 'react';
import { FieldError, Label, Text } from 'react-aria-components';

import { cx } from '../utils/cx';
import styles from './Field.module.css';

/** Props that every labelled control of `@panneau/ui` accepts. */
export interface FieldChromeProps {
    /** Visible label. Without one, pass `aria-label`. */
    label?: ReactNode;
    /** Help text under the control. */
    description?: ReactNode;
    /** Error messages. Any message makes the control invalid. */
    errors?: readonly string[];
    /** Class name of the outer element. */
    className?: string;
    labelClassName?: string;
    descriptionClassName?: string;
    errorsClassName?: string;
}

export function FieldLabel({
    children,
    isRequired = false,
    className,
}: {
    children?: ReactNode;
    isRequired?: boolean;
    className?: string | undefined;
}) {
    if (children === undefined || children === null) {
        return null;
    }
    return (
        <Label className={cx(styles.label, className)}>
            {children}
            {isRequired ? (
                <span className={styles.required} aria-hidden="true">
                    *
                </span>
            ) : null}
        </Label>
    );
}

export function FieldDescription({
    children,
    className,
}: {
    children?: ReactNode;
    className?: string | undefined;
}) {
    if (children === undefined || children === null) {
        return null;
    }
    return (
        <Text slot="description" className={cx(styles.description, className)}>
            {children}
        </Text>
    );
}

/** Error messages of a React Aria field. They show when the field is invalid. */
export function FieldErrors({
    errors = [],
    className,
}: {
    errors?: readonly string[] | undefined;
    className?: string | undefined;
}) {
    if (errors.length === 0) {
        return null;
    }
    return (
        <FieldError className={cx(styles.errors, className)}>
            {errors.map((error, index) => (
                <Fragment key={index}>
                    {/* A space between messages, for assistive technologies. */}
                    {index > 0 ? ' ' : null}
                    <span className={styles.error}>{error}</span>
                </Fragment>
            ))}
        </FieldError>
    );
}

export { styles as fieldStyles };
