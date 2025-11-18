/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

import Button from '@panneau/element-button';

const propTypes = {
    label: PropTypes.string,
    name: PropTypes.string,
    value: PropTypes.bool,
    href: PropTypes.string,
    theme: PropTypes.string,
    activeTheme: PropTypes.string,
    disableOutline: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
};

function ButtonFilter({
    name = 'button',
    label = null,
    value = false,
    href = null,
    theme = 'primary',
    activeTheme = 'primary',
    disableOutline = false,
    onChange,
    className = null,
    ...props
}) {
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
    }, [isActive, href, name, onChange]);

    return (
        <div
            className={classNames([
                {
                    [className]: className !== null,
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

ButtonFilter.propTypes = propTypes;

export default ButtonFilter;
