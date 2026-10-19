import { Fragment, type ReactNode, useId } from 'react';

import { cx } from '../utils/cx';
import styles from './Field.module.css';

export interface FieldsetProps {
    /** Title of the group of controls. */
    legend?: ReactNode;
    description?: ReactNode;
    /** Errors of the group as a whole. */
    errors?: readonly string[];
    isRequired?: boolean;
    isDisabled?: boolean;
    children?: ReactNode;
    className?: string;
    legendClassName?: string;
    descriptionClassName?: string;
    errorsClassName?: string;
}

/**
 * Groups related controls under a legend, with a description and errors: for composite values
 * (a group of fields, a list of blocks, a value per locale). The description and the errors
 * describe the group for assistive technologies.
 */
export function Fieldset({
    legend,
    description,
    errors = [],
    isRequired = false,
    isDisabled = false,
    children,
    className,
    legendClassName,
    descriptionClassName,
    errorsClassName,
}: FieldsetProps) {
    const id = useId();
    const descriptionId = description !== undefined ? `${id}-description` : null;
    const errorsId = errors.length > 0 ? `${id}-errors` : null;
    const describedBy = [descriptionId, errorsId].filter(Boolean).join(' ');
    return (
        <fieldset
            data-panneau="fieldset"
            className={cx(styles.fieldset, className)}
            aria-describedby={describedBy !== '' ? describedBy : undefined}
            aria-invalid={errors.length > 0 ? true : undefined}
            disabled={isDisabled}
        >
            {legend !== undefined && legend !== null ? (
                <legend className={cx(styles.legend, styles.label, legendClassName)}>
                    {legend}
                    {isRequired ? (
                        <span className={styles.required} aria-hidden="true">
                            *
                        </span>
                    ) : null}
                </legend>
            ) : null}
            {descriptionId !== null ? (
                <div id={descriptionId} className={cx(styles.description, descriptionClassName)}>
                    {description}
                </div>
            ) : null}
            {children}
            {errorsId !== null ? (
                <div id={errorsId} className={cx(styles.errors, errorsClassName)}>
                    {errors.map((error, index) => (
                        <Fragment key={index}>
                            {/* A space between messages, for assistive technologies. */}
                            {index > 0 ? ' ' : null}
                            <span className={styles.error}>{error}</span>
                        </Fragment>
                    ))}
                </div>
            ) : null}
        </fieldset>
    );
}
