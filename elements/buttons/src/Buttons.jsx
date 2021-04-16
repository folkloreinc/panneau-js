/* eslint-disable react/no-array-index-key, react/button-has-type, react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isArray from 'lodash/isArray';

import Button from '@panneau/element-button';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

import styles from './styles.module.scss';

const propTypes = {
    items: PanneauPropTypes.buttons,
    size: PanneauPropTypes.buttonSize,
    renderButton: PropTypes.func,
    onClickButton: PropTypes.func,
    className: PropTypes.string,
    buttonClassName: PropTypes.string,
};

const defaultProps = {
    items: [],
    size: null,
    renderButton: null,
    onClickButton: null,
    className: null,
    buttonClassName: null,
};

const Buttons = ({ items, size, renderButton, onClickButton, buttonClassName, className }) => (
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
        {isArray(items)
            ? items.map((button, index) => {
                  const {
                      className: customClassName = null,
                      onClick = null,

                      ...buttonProps
                  } = button || {};
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
              })
            : null}
    </div>
);

Buttons.propTypes = propTypes;
Buttons.defaultProps = defaultProps;

export default Buttons;
