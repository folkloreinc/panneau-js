import classNames from 'classnames';
import { useCallback, useMemo } from 'react';

import type { ButtonTheme } from '@panneau/core';
import Button from '@panneau/element-button';

interface ButtonFilterProps {
    onChange: (value: boolean | null) => void;
    onClear: (() => void) | null;
    label?: string | null;
    name?: string;
    value?: boolean | string | number | null;
    href?: string | null;
    theme?: ButtonTheme;
    activeTheme?: ButtonTheme;
    disableOutline?: boolean;
    className?: string | null;
}

function ButtonFilter({
    onChange = null,
    onClear = null,
    name = 'button',
    label = null,
    value = false,
    href = null,
    theme = 'primary',
    activeTheme = 'primary',
    disableOutline = false,
    className = null,
    ...props
}: ButtonFilterProps) {
    const isActive = useMemo(
        () =>
            value !== null && (value === true || value === 'true' || value === 1 || value === '1'),
        [value],
    );

    const onClick = useCallback(() => {
        if (href === null) {
            if (isActive) {
                onChange(null);
            } else {
                onChange(true);
            }
        }
    }, [isActive, href, onChange]);

    return (
        <div
            className={classNames([
                {
                    [className!]: className !== null,
                },
            ])}
        >
            <Button
                href={href}
                label={label}
                name={name}
                onClick={onClick}
                outline={(!isActive || href !== null) && !disableOutline}
                theme={isActive ? activeTheme : theme}
                {...props}
            />
        </div>
    );
}

export default ButtonFilter;
