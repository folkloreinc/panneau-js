import { type ReactNode, useState } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-aria-components';

import { Icon, type IconComponent } from '../icon/Icon';
import { Tooltip } from '../tooltip/Tooltip';
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
    /**
     * Shows only the icon of each option, in a square segment. The label becomes its accessible
     * name and a tooltip, so it must be a string (or come with a `textValue`).
     */
    hideLabels?: boolean;
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
    hideLabels = false,
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
                hideLabels && styles.iconOnly,
                className,
            )}
        >
            {options.map((option) => {
                const name =
                    option.textValue ??
                    (typeof option.label === 'string' ? option.label : undefined);
                const segment = (
                    <ToggleButton
                        key={option.value}
                        id={option.value}
                        isDisabled={option.isDisabled}
                        {...(name !== undefined && (hideLabels || option.textValue !== undefined)
                            ? { 'aria-label': name }
                            : {})}
                        className={cx('panneau-segment', styles.segment, segmentClassName)}
                    >
                        {option.icon !== undefined ? (
                            <Icon icon={option.icon} size={size === 'sm' ? 'sm' : 'md'} />
                        ) : null}
                        {hideLabels ? null : option.label}
                    </ToggleButton>
                );
                return hideLabels ? (
                    <Tooltip key={option.value} content={option.label}>
                        {segment}
                    </Tooltip>
                ) : (
                    segment
                );
            })}
        </ToggleButtonGroup>
    );
}
