import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import * as PanneauPropTypes from '../lib/PropTypes';
import Button from './Button';

import styles from '../styles/components/button-group.scss';

const propTypes = {
    buttons: PanneauPropTypes.buttons,
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
    style: null,
    href: null,
    noWrap: false,
    toggle: false,
    onClick: null,
    className: null,
    buttonClassName: null,
};

const ButtonGroup = ({
    buttons,
    onClick,
    className,
    style,
    buttonClassName,
    noWrap,
    toggle,
    ...props
}) => (
    <div
        className={classNames({
            'btn-group': true,
            [styles.container]: true,
            [styles.noWrap]: noWrap,
            [className]: className !== null,
        })}
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
                            [customClassName]: customClassName !== null,
                            [buttonClassName]: buttonClassName !== null,
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
