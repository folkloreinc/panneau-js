import type { ReactNode } from 'react';
import { Switch as AriaSwitch, type SwitchProps as AriaSwitchProps } from 'react-aria-components';

import { ChoiceChrome, type ChoiceChromeProps } from '../checkbox/ChoiceChrome';
import { cx } from '../utils/cx';
import styles from './Switch.module.css';

export interface SwitchProps
    extends Omit<AriaSwitchProps, 'className' | 'style' | 'children'>, ChoiceChromeProps {
    /** Label, next to the switch. */
    children?: ReactNode;
    switchClassName?: string;
}

/** An on and off switch, for settings that apply at once. */
export function Switch({
    children,
    description,
    errors = [],
    className,
    switchClassName,
    descriptionClassName,
    errorsClassName,
    ...props
}: SwitchProps) {
    return (
        <ChoiceChrome
            component="switch"
            description={description}
            errors={errors}
            className={className}
            descriptionClassName={descriptionClassName}
            errorsClassName={errorsClassName}
        >
            {(describedBy) => (
                <AriaSwitch
                    {...props}
                    aria-describedby={describedBy}
                    className={cx(styles.switch, switchClassName)}
                >
                    <span className={styles.track} aria-hidden="true">
                        <span className={styles.thumb} />
                    </span>
                    {children !== undefined ? (
                        <span className={styles.label}>{children}</span>
                    ) : null}
                </AriaSwitch>
            )}
        </ChoiceChrome>
    );
}
