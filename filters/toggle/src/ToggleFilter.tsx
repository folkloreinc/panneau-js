import classNames from 'classnames';
import Switch from 'rc-switch';
import { useCallback } from 'react';

import styles from './styles.module.css';
import 'rc-switch/assets/index.css';

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
                    [className!]: className !== null,
                },
            ])}
        >
            {label !== null ? <span className="me-2">{label}</span> : null}
            <Switch {...props} name={name} checked={isTrue} onChange={onToggleChange} />
        </div>
    );
}

export default ToggleFilter;
