import { Check, Minus } from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Checkbox as AriaCheckbox,
    type CheckboxProps as AriaCheckboxProps,
} from 'react-aria-components';

import { Icon } from '../icon/Icon';
import { cx } from '../utils/cx';
import styles from './Checkbox.module.css';
import { ChoiceChrome, type ChoiceChromeProps } from './ChoiceChrome';

export interface CheckboxProps
    extends
        Omit<AriaCheckboxProps, 'className' | 'style' | 'children' | 'isInvalid' | 'validate'>,
        ChoiceChromeProps {
    /** Label, next to the box. */
    children?: ReactNode;
    checkboxClassName?: string;
}

/** A checkbox with its label, and optional description and errors under it. */
export function Checkbox({
    children,
    description,
    errors = [],
    className,
    checkboxClassName,
    descriptionClassName,
    errorsClassName,
    ...props
}: CheckboxProps) {
    return (
        <ChoiceChrome
            description={description}
            errors={errors}
            className={className}
            descriptionClassName={descriptionClassName}
            errorsClassName={errorsClassName}
        >
            {(describedBy) => (
                <AriaCheckbox
                    {...props}
                    aria-describedby={describedBy}
                    isInvalid={errors.length > 0}
                    validationBehavior="aria"
                    className={cx(styles.checkbox, checkboxClassName)}
                >
                    {({ isSelected, isIndeterminate }) => (
                        <>
                            <span className={styles.box} aria-hidden="true">
                                {isIndeterminate ? (
                                    <Icon icon={Minus} size="xs" />
                                ) : isSelected ? (
                                    <Icon icon={Check} size="xs" />
                                ) : null}
                            </span>
                            {children !== undefined ? (
                                <span className={styles.label}>{children}</span>
                            ) : null}
                        </>
                    )}
                </AriaCheckbox>
            )}
        </ChoiceChrome>
    );
}
