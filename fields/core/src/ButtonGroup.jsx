import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';

import styles from './styles/button-group.scss';

const propTypes = {
    buttons: PropTypes.arrayOf(
        PropTypes.oneOfType([
            PropTypes.node,
            PropTypes.shape({
                label: PropTypes.node,
                icon: PropTypes.node,
            }),
        ]),
    ),
    href: PropTypes.string,
    onClick: PropTypes.func,
    noWrap: PropTypes.bool,
    className: PropTypes.string,
    buttonClassName: PropTypes.string,
};

const defaultProps = {
    buttons: [],
    href: null,
    noWrap: false,
    onClick: null,
    className: null,
    buttonClassName: null,
};

const ButtonGroup = ({
    buttons, onClick, className, buttonClassName, noWrap, ...props
}) => (
    <div
        className={classNames({
            'btn-group': true,
            [styles.container]: true,
            [styles.noWrap]: noWrap,
            [className]: className !== null,
        })}
        {...props}
    >
        {buttons.map((button, index) => {
            if (React.isValidElement(button)) {
                return React.cloneElement(button, {
                    key: `button-${button.name || button.id || index}`,
                });
            }
            const {
                id = null,
                key = null,
                name = null,
                label = null,
                icon = null,
                className: customClassName = null,
                ...customProps
            } = button;
            const buttonProps = {
                key: `button-${id || key || name || label || icon || index}`,
                href: null,
                className: classNames({
                    btn: true,
                    'btn-light': true,
                    [styles.button]: true,
                    [buttonClassName]: buttonClassName !== null,
                    [customClassName || null]: (customClassName || null) !== null,
                }),
                onClick: (e) => {
                    if (onClick) {
                        onClick(e, button, index);
                    }
                },
                ...customProps,
            };
            let iconElement = null;
            if (icon !== null) {
                iconElement = isString(icon) ? (
                    <span
                        className={classNames([
                            styles.icon,
                            icon,
                            {
                                [styles.withLabel]: !isEmpty(label),
                            },
                        ])}
                    />
                ) : (
                    icon
                );
            }
            return buttonProps.href !== null ? (
                <a {...buttonProps}>
                    {iconElement}
                    {label}
                </a>
            ) : (
                <button type="button" {...buttonProps}>
                    {iconElement}
                    {label}
                </button>
            );
        })}
    </div>
);

ButtonGroup.propTypes = propTypes;
ButtonGroup.defaultProps = defaultProps;

export default ButtonGroup;
