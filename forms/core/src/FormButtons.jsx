/* eslint-disable react/button-has-type */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { PropTypes as PanneauPropTypes, isMessage } from '@panneau/core';

import styles from './styles/form-buttons.scss';

const propTypes = {
    buttons: PanneauPropTypes.buttons,
    className: PropTypes.string,
};

const defaultProps = {
    buttons: [],
    className: null,
};

const FormButtons = ({ buttons, className }) => (
    <div
        className={classNames([
            styles.container,
            {
                [className]: className !== null,
            },
        ])}
    >
        <div className="btn-group">
            {buttons.map(({
                id, label, type, className: buttonClassName = null, onClick,
            }) => (
                <button
                    key={`actions-button-${id}`}
                    type={type}
                    className={classNames([
                        'btn',
                        styles.button,
                        styles[type],
                        {
                            [buttonClassName]: buttonClassName !== null,
                        },
                    ])}
                    onClick={onClick || null}
                >
                    {isMessage(label) ? <FormattedMessage {...label} /> : label}
                </button>
            ))}
        </div>
    </div>
);

FormButtons.propTypes = propTypes;
FormButtons.defaultProps = defaultProps;

export default FormButtons;
