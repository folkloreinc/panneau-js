import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const propTypes = {
    buttons: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.node,
        icon: PropTypes.string,
    })),
    href: PropTypes.string,
    onClick: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    buttons: [],
    href: null,
    onClick: null,
    className: null,
};

const ButtonGroup = ({
    buttons, onClick, className, ...props
}) => (
    <div
        className={classNames({
            'btn-group': true,
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

            const { label, icon, ...customProps } = button;
            const key = `button-${button.key || button.name || button.label || button.icon}`;
            const onClickButton = (e) => {
                if (onClick) {
                    onClick(e, button, index);
                }
            };
            const buttonProps = {
                key,
                href: null,
                className: 'btn btn-default',
                onClick: onClickButton,
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
