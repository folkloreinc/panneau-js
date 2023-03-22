import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Button from '@panneau/element-button';
import Icon from '@panneau/element-icon';
import Label from '@panneau/element-label';

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
            <Icon name="x-lg" bold className="d-block" />
        </Button>
    </div>
);
Alert.propTypes = propTypes;
Alert.defaultProps = defaultProps;

export default Alert;
