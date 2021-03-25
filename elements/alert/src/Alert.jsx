import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

import Label from '@panneau/element-label';
import Button from '@panneau/element-button';

const propTypes = {
    theme: PanneauPropTypes.buttonTheme,
    children: PanneauPropTypes.label.isRequired,
    onClose: PropTypes.func,
    className: PropTypes.string,
};

const defaultProps = {
    theme: 'success',
    onClose: null,
    className: null,
};

const Alert = ({ theme, children, onClose, className }) => (
    <div
        className={classNames([
            'alert',
            `alert-${theme}`,
            // 'alert-dismissible',
            'show',
            'd-flex',
            'align-items-center',
            'justify-content-between',
            {
                [className]: className !== null,
            },
        ])}
    >
        <Label>{children}</Label>
        <Button
            type="button"
            className={classNames([`btn-outline-${theme}`, 'ms-2'])}
            aria-label="Close"
            onClick={onClose}
        >
            <FontAwesomeIcon icon={faTimes} className="d-block" />
        </Button>
    </div>
);
Alert.propTypes = propTypes;
Alert.defaultProps = defaultProps;

export default Alert;
