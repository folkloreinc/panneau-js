import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './styles/button-group.scss';

const propTypes = {
    buttons: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.shape({
            label: PropTypes.node,
            icon: PropTypes.string,
        }),
    ])),
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
            if (button.type && button.props && button.$$typeof) {
                return React.cloneElement(button, {
                    key: `button-${button.name || button.id || index}`,
                });
            }
            const {
                label, icon, className: customClassName, ...customProps
            } = button;
            const buttonProps = {
                key: `button-${button.key || button.name || button.label || button.icon}`,
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
            return buttonProps.href !== null ? (
                <a {...buttonProps}>
                    {icon ? <span className={icon} /> : null} {button.label}
                </a>
            ) : (
                <button type="button" {...buttonProps}>
                    {icon ? <span className={icon} /> : null} {button.label}
                </button>
            );
        })}
    </div>
);

ButtonGroup.propTypes = propTypes;
ButtonGroup.defaultProps = defaultProps;

export default ButtonGroup;
