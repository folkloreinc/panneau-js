/* eslint-disable react/jsx-props-no-spreading */
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
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
    inline: PropTypes.bool,
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
    inline: false,
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
    inline,
    withoutLabel,
    withoutErrors,
    labelAfter,
    className,
    labelClassName,
}) => {
    const vertical = horizontal || inline;

    const labelElement =
        !withoutLabel && label !== null ? (
            <label
                htmlFor={name}
                className={classNames([
                    styles.label,
                    {
                        'form-label': !inline,
                        'col-form-label': inline || horizontal,
                        'col-sm-4': horizontal,
                        'px-2': horizontal,
                        'text-nowrap': horizontal,
                        [labelClassName]: labelClassName !== null,
                    },
                ])}
            >
                {label}
            </label>
        ) : null;

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

    const finalElements = horizontal ? (
        <div>
            <Column wrap={horizontal}>{helpElement}</Column>
            <Column wrap={horizontal}>{errorsElement}</Column>
        </div>
    ) : (
        <>
            <Column wrap={horizontal}>{helpElement}</Column>
            <Column wrap={horizontal}>{errorsElement}</Column>
        </>
    );

    return (
        <div
            className={classNames([
                styles.container,
                'mb-3',
                {
                    [className]: className !== null,
                },
            ])}
        >
            <div
                className={classNames([
                    {
                        row: vertical,
                        'g-3': vertical,
                        'align-items-center': vertical,
                        'form-floating': floating,
                    },
                ])}
            >
                <Column wrap={vertical} className={classNames({ 'col-sm-3': horizontal })}>
                    { !labelAfter ? labelElement : null}
                </Column>
                <Column wrap={vertical} className={classNames({ 'col-sm-9': horizontal })}>
                    {children}
                </Column>
                <Column wrap={vertical} className={classNames({ 'col-sm-3': horizontal })}>
                    { labelAfter ? labelElement : null}
                </Column>
                {finalElements}
            </div>
        </div>
    );
};

FormGroup.propTypes = propTypes;
FormGroup.defaultProps = defaultProps;

export default FormGroup;
