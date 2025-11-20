import classNames from 'classnames';
import { useCallback } from 'react';

import styles from './styles.module.css';

interface RangeProps {
    title?: string | null;
    max?: number;
    value?: number;
    onChange: (value: string) => void;
    className?: string | null;
}

function Range({ title = null, value = 50, onChange, max = 100, className = null }: RangeProps) {
    const onValueChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.value);
        },
        [onChange, max],
    );
    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className!]: className !== null,
                },
            ])}
        >
            <h4>
                <label className={styles.label} htmlFor="range">
                    {title}
                </label>
            </h4>
            <input
                className="form-range"
                type="range"
                id="range"
                min="0"
                max={max}
                onChange={onValueChange}
                value={value}
            />
        </div>
    );
}

export default Range;
