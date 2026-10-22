import { type ReactNode, useState } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-aria-components';

import { Icon, type IconComponent } from '../icon/Icon';
import { cx } from '../utils/cx';
import styles from './SegmentedControl.module.css';

/** One choice of a segmented control. */
export interface SegmentedControlOption {
    value: string;
    label: ReactNode;
    /** Text for typeahead and assistive technologies, when `label` isn't a string. */
    textValue?: string;
    icon?: IconComponent;
    isDisabled?: boolean;
}

export interface SegmentedControlProps {
    options: readonly SegmentedControlOption[];
    /** The selected option. Controlled with `onChange`. */
    value?: string;
    /** The option selected first, when uncontrolled. Defaults to the first one. */
    defaultValue?: string;
    onChange?: (value: string) => void;
    /** Accessible name of the group. Without a visible label, it is required. */
    'aria-label'?: string;
    'aria-labelledby'?: string;
    size?: 'sm' | 'md';
    /** Takes the width of its container, with segments of equal width. */
    fullWidth?: boolean;
    isDisabled?: boolean;
    className?: string;
    segmentClassName?: string;
}

/**
 * A row of a few choices, one of which is always selected: a view, a mode, a library. For more
 * than four or five choices, or long labels, use a `Select`. It is a radio group for assistive
 * technologies, moved through with the arrow keys.
 */
export function SegmentedControl({
    options,
    value,
    defaultValue,
    onChange,
    size = 'md',
    fullWidth = false,
    isDisabled,
    className,
    segmentClassName,
    ...props
}: SegmentedControlProps) {
    const [uncontrolled, setUncontrolled] = useState(
        () => defaultValue ?? options.find((option) => option.isDisabled !== true)?.value,
    );
    const selected = value ?? uncontrolled;
    return (
        <ToggleButtonGroup
            {...props}
            selectionMode="single"
            disallowEmptySelection
            isDisabled={isDisabled}
            selectedKeys={selected !== undefined ? [selected] : []}
            onSelectionChange={(keys) => {
                const [key] = [...keys];
                // React Aria reports the selected segment again when it is pressed.
                if (key === undefined || String(key) === selected) {
                    return;
                }
                setUncontrolled(String(key));
                onChange?.(String(key));
            }}
            className={cx(
                'panneau-segmented-control',
                styles.group,
                styles[size],
                fullWidth && styles.fullWidth,
                className,
            )}
        >
            {options.map((option) => (
                <ToggleButton
                    key={option.value}
                    id={option.value}
                    isDisabled={option.isDisabled}
                    {...(option.textValue !== undefined ? { 'aria-label': option.textValue } : {})}
                    className={cx('panneau-segment', styles.segment, segmentClassName)}
                >
                    {option.icon !== undefined ? (
                        <Icon icon={option.icon} size={size === 'sm' ? 'sm' : 'md'} />
                    ) : null}
                    {option.label}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}
