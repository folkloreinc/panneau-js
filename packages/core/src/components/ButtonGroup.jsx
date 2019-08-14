/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as PanneauPropTypes from '../lib/PropTypes';
import Button from './Button';

import styles from '../styles/components/button-group.scss';

const propTypes = {
    buttons: PanneauPropTypes.buttons,
    size: PanneauPropTypes.buttonSize,
    style: PanneauPropTypes.buttonStyle,
    href: PropTypes.string,
    onClick: PropTypes.func,
    noWrap: PropTypes.bool,
    toggle: PropTypes.bool,
    className: PropTypes.string,
    buttonClassName: PropTypes.string,
};

const defaultProps = {
    buttons: [],
    size: null,
    style: 'outline-secondary',
    href: null,
    noWrap: false,
    toggle: false,
    onClick: null,
    className: null,
    buttonClassName: null,
};

const ButtonGroup = ({
    buttons,
    style,
    size,
    noWrap,
    toggle,
    className,
    buttonClassName,
    onClick,
    ...props
}) => (
    <div
        className={classNames([
            'btn-group',
            styles.container,
            {
                [`btn-group-${size}`] : size !== null,
                [styles.noWrap]: noWrap,
                [className]: className !== null,
            },
        ])}
        {...(toggle
            ? {
                  'data-toggle': 'buttons',
              }
            : null)}
        {...props}
    >
        {buttons.map((button, index) => {
            const key = `button-${button.name || button.id || index}`;
            if (React.isValidElement(button)) {
                return React.cloneElement(button, {
                    key,
                });
            }
            const {
                className: customClassName = null,
                style: buttonStyle = style,
                active = false,
                ...buttonProps
            } = button;
            return (
                <Button
                    {...buttonProps}
                    style={buttonStyle}
                    key={key}
                    className={classNames([
                        styles.button,
                        {
                            'active': active,
                            [buttonClassName]: buttonClassName !== null,
                            [customClassName]: customClassName !== null,
                        },
                    ])}
                />
            );
        })}
    </div>
);

ButtonGroup.propTypes = propTypes;
ButtonGroup.defaultProps = defaultProps;

export default ButtonGroup;
