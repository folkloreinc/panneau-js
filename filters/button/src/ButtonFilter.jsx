/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

import Button from '@panneau/element-button';

import styles from './styles.module.scss';

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

const defaultProps = {
    label: null,
    name: 'button',
    value: false,
    href: null,
    theme: 'primary',
    activeTheme: 'primary',
    disableOutline: false,
    className: null,
};

const ButtonFilter = ({
    name,
    label,
    value,
    href,
    theme,
    activeTheme,
    disableOutline,
    onChange,
    className,
    ...props
}) => {
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
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
        >
            <Button
                {...props}
                href={href}
                label={label}
                name={name}
                onClick={onClick}
                outline={(!isActive || href !== null) && !disableOutline}
                theme={isActive ? activeTheme : theme}
            />
        </div>
    );
};

ButtonFilter.propTypes = propTypes;
ButtonFilter.defaultProps = defaultProps;

export default ButtonFilter;
