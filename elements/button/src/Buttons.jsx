/* eslint-disable react/no-array-index-key, react/button-has-type, react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PropTypes as MicromagPropTypes } from '@panneau/core';

import Button from './Button';

import styles from './buttons.module.scss';

const propTypes = {
    buttons: MicromagPropTypes.buttons,
    size: MicromagPropTypes.buttonSize,
    renderButton: PropTypes.func,
    onClickButton: PropTypes.func,
    className: PropTypes.string,
    buttonClassName: PropTypes.string,
};

const defaultProps = {
    buttons: [],
    size: null,
    renderButton: null,
    onClickButton: null,
    className: null,
    buttonClassName: null,
};

const Buttons = ({ buttons, size, renderButton, onClickButton, buttonClassName, className }) => (
    <div
        className={classNames([
            'btn-group',
            {
                [`btn-group-${size}`]: size !== null,
            },
            styles.container,
            {
                [className]: className !== null,
            },
        ])}
        role="group"
    >
        {buttons.map((button, index) => {
            const {
                className: customClassName = null,
                onClick = null,

                ...buttonProps
            } = button;
            const fixedProps = {
                key: `button-${index}`,
                className: classNames([
                    styles.button,
                    {
                        [buttonClassName]: buttonClassName !== null,
                        [customClassName]: customClassName !== null,
                    },
                ]),
                onClick: (e) => {
                    if (onClick !== null) {
                        onClick(e, button, index);
                    }
                    if (onClickButton !== null) {
                        onClickButton(e, button, index);
                    }
                },
            };
            return renderButton !== null ? (
                renderButton(button, index, fixedProps)
            ) : (
                <Button {...fixedProps} {...buttonProps} />
            );
        })}
    </div>
);

Buttons.propTypes = propTypes;
Buttons.defaultProps = defaultProps;

export default Buttons;
