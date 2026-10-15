import { Fragment, type ReactNode, useId } from 'react';

import { fieldStyles } from '../field/FieldParts';
import { cx } from '../utils/cx';
import styles from './Checkbox.module.css';

export interface ChoiceChromeProps {
    /** Help text under the control. */
    description?: ReactNode;
    /** Error messages. Any message makes the control invalid. */
    errors?: readonly string[];
    className?: string;
    descriptionClassName?: string;
    errorsClassName?: string;
}

/** Description and errors under a checkbox or a switch, linked to it. */
export function ChoiceChrome({
    description,
    errors = [],
    className,
    descriptionClassName,
    errorsClassName,
    children,
}: ChoiceChromeProps & { children: (describedBy: string | undefined) => ReactNode }) {
    const id = useId();
    const descriptionId =
        description !== undefined && description !== null ? `${id}-description` : null;
    const errorsId = errors.length > 0 ? `${id}-errors` : null;
    const describedBy = [descriptionId, errorsId].filter(Boolean).join(' ');
    return (
        <div className={cx(styles.field, className)}>
            {children(describedBy !== '' ? describedBy : undefined)}
            {descriptionId !== null ? (
                <div
                    id={descriptionId}
                    className={cx(fieldStyles.description, descriptionClassName)}
                >
                    {description}
                </div>
            ) : null}
            {errorsId !== null ? (
                <div id={errorsId} className={cx(fieldStyles.errors, errorsClassName)}>
                    {errors.map((error, index) => (
                        <Fragment key={index}>
                            {/* A space between messages, for assistive technologies. */}
                            {index > 0 ? ' ' : null}
                            <span className={fieldStyles.error}>{error}</span>
                        </Fragment>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
