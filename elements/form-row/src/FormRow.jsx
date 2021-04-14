/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
// import { PropTypes as PanneauPropTypes } from '@panneau/core';

import styles from './styles.module.scss';

const propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
};

const defaultProps = {
    children: null,
    className: null,
};

const FormRow = ({ children, className }) => (
    <div
        className={classNames([
            styles.container,
            'form-row',
            {
                [className]: className !== null,
            },
        ])}
    >
        {children}
    </div>
);

FormRow.propTypes = propTypes;
FormRow.defaultProps = defaultProps;

export default FormRow;
