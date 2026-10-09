import classNames from 'classnames';
import RcSwitch from 'rc-switch';
import type { ButtonHTMLAttributes, ComponentProps, ComponentType } from 'react';
import { useCallback } from 'react';

import styles from './styles.module.css';
import 'rc-switch/assets/index.css';

// rc-switch spreads extra props on its <button> element, but its typings omit button
// specific attributes such as `name`
const Switch = RcSwitch as ComponentType<
    ComponentProps<typeof RcSwitch> & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'name'>
>;

interface ToggleFilterProps {
    onChange: (value: boolean) => void;
    onClear: () => void;
    name?: string;
    value?: boolean | string | number | null;
    label?: string | null;
    vertical?: boolean;
    className?: string | null;
}

function ToggleFilter({
    onChange = null,
    onClear = null,
    name = 'toggle',
    value = false,
    label = null,
    vertical = false,
    className = null,
    ...props
}: ToggleFilterProps) {
    const isTrue =
        value !== null && (value === true || value === 'true' || value === 1 || value === '1');

    const onToggleChange = useCallback(
        (newValue: boolean) => {
            if (newValue === false && onClear !== null) {
                onClear();
            } else if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange, onClear],
    );

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [styles.vertical]: vertical,
                },
                className,
            ])}
        >
            {label !== null ? <span className="me-2">{label}</span> : null}
            <Switch {...props} name={name} checked={isTrue} onChange={onToggleChange} />
        </div>
    );
}

export default ToggleFilter;
