import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isArray from 'lodash/isArray';

import { errors as errorsPropTypes } from '../lib/PropTypes';
import styles from '../styles/components/errors.scss';

const propTypes = {
    errors: errorsPropTypes,
    className: PropTypes.string,
};

const defaultProps = {
    errors: [],
    className: null,
};

const Errors = ({ errors, className }) =>
    errors !== null && errors.length > 0 ? (
        <div
            className={classNames([
                'alert',
                'alert-danger',
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
        >
            {isArray(errors) ? (
                <ul>
                    {errors.map(error => (
                        <li key={`error-${error}`}>{error}</li>
                    ))}
                </ul>
            ) : (
                errors
            )}
        </div>
    ) : null;

Errors.propTypes = propTypes;
Errors.defaultProps = defaultProps;

export default Errors;
