/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

import styles from './styles.module.scss';

const propTypes = {
    name: PropTypes.string,
    label: PanneauPropTypes.label,
    errors: PanneauPropTypes.formErrors,
    helpText: PropTypes.node,
    children: PropTypes.node,
    horizontal: PropTypes.bool,
    floating: PropTypes.bool,
    column: PropTypes.bool,
    withoutLabel: PropTypes.bool,
    withoutErrors: PropTypes.bool,
    labelAfter: PropTypes.bool,
    className: PropTypes.string,
    labelClassName: PropTypes.string,
};

const defaultProps = {
    name: null,
    label: null,
    errors: null,
    helpText: null,
    children: null,
    horizontal: false,
    floating: false,
    column: false,
    withoutLabel: false,
    withoutErrors: false,
    labelAfter: false,
    className: null,
    labelClassName: null,
};

const FormGroup = ({
    name,
    label,
    helpText,
    children,
    errors,
    horizontal,
    floating,
    column,
    withoutLabel,
    withoutErrors,
    labelAfter,
    className,
    labelClassName,
}) => {
    const labelElement = (
        <label
            htmlFor={name}
            className={classNames([
                styles.label,
                {
                    'form-label': !column,
                    'col-form-label': column,
                    'col-sm-2': horizontal,
                    'px-2': horizontal,
                    [labelClassName]: labelClassName !== null,
                },
            ])}
        >
            {label}
        </label>
    );

    return (
        <div
            className={classNames([
                styles.container,
                'form-group',
                'mb-2',

                {
                    row: horizontal,

                    [className]: className !== null,
                },
            ])}
        >
            <div
                className={classNames([
                    {
                        'col-sm-10': horizontal,
                        'px-2': horizontal,
                        'form-floating': floating,
                    },
                ])}
            >
                {!withoutLabel && !labelAfter && label !== null ? labelElement : null}
                {children}
                {!withoutLabel && labelAfter && label !== null ? labelElement : null}
                {helpText !== null ? (
                    <small className={classNames([styles.help, 'form-text', 'text-muted'])}>
                        {helpText}
                    </small>
                ) : null}
                {!withoutErrors && errors !== null ? (
                    <div className={classNames([styles.errors, 'invalid-feedback', 'd-block'])}>
                        <ul className="list-unstyled">
                            {errors.map((error) => (
                                <li key={`error-${error}`}>{error}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

FormGroup.propTypes = propTypes;
FormGroup.defaultProps = defaultProps;

export default FormGroup;
