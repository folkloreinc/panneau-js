/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

import Column from './Column';

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
                    'text-nowrap': horizontal,
                    [labelClassName]: labelClassName !== null,
                },
            ])}
        >
            {label}
        </label>
    );

    const helpElement =
        helpText !== null ? (
            <small className={classNames([styles.help, 'form-text', 'text-muted'])}>
                {helpText}
            </small>
        ) : null;

    const errorsElement =
        !withoutErrors && errors !== null ? (
            <div className={classNames([styles.errors, 'invalid-feedback', 'd-block'])}>
                <ul className="list-unstyled">
                    {errors.map((error) => (
                        <li key={`error-${error}`}>{error}</li>
                    ))}
                </ul>
            </div>
        ) : null;

    return (
        <div
            className={classNames([
                styles.container,
                'form-group',
                'mb-2',
                {
                    [className]: className !== null,
                },
            ])}
        >
            <div
                className={classNames([
                    {
                        row: horizontal,
                        'g-3': horizontal,
                        'align-items-center': horizontal,
                        'form-floating': floating,
                    },
                ])}
            >
                <Column horizontal={horizontal}>
                    {!withoutLabel && !labelAfter && label !== null ? labelElement : null}
                </Column>
                <Column horizontal={horizontal}>{children}</Column>
                <Column horizontal={horizontal}>
                    {!withoutLabel && labelAfter && label !== null ? labelElement : null}
                </Column>
                <Column horizontal={horizontal}>{helpElement}</Column>
                <Column horizontal={horizontal}>{errorsElement}</Column>
            </div>
        </div>
    );
};

FormGroup.propTypes = propTypes;
FormGroup.defaultProps = defaultProps;

export default FormGroup;
