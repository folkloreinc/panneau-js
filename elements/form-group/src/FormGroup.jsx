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
    withoutLabel: PropTypes.bool,
    withoutErrors: PropTypes.bool,
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
    withoutLabel: false,
    withoutErrors: false,
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
    withoutLabel,
    withoutErrors,
    className,
    labelClassName,
}) => (
    <div
        className={classNames([
            styles.container,
            'form-group',
            {
                row: horizontal,
                'mx-n2': horizontal,
                [className]: className !== null,
            },
        ])}
    >
        {!withoutLabel && label !== null ? (
            <label
                htmlFor={name}
                className={classNames([
                    {
                        'col-sm-2': horizontal,
                        'px-2': horizontal,
                        [labelClassName]: labelClassName !== null,
                    },
                ])}
            >
                {label}
            </label>
        ) : null}
        <div
            className={classNames([
                {
                    'col-sm-10': horizontal,
                    'px-2': horizontal,
                },
            ])}
        >
            {children}
            {helpText !== null ? <small className="form-text text-muted">{helpText}</small> : null}
            {!withoutErrors && errors !== null ? (
                <div className={classNames(['invalid-feedback', 'd-block'])}>
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

FormGroup.propTypes = propTypes;
FormGroup.defaultProps = defaultProps;

export default FormGroup;
