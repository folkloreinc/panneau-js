/* eslint-disable react/jsx-props-no-spreading */
import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import Button from '@panneau/element-button';

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
    isList: PropTypes.bool,
    isListItem: PropTypes.bool,
    isCard: PropTypes.bool,
    isHeading: PropTypes.bool,
    isCollapsible: PropTypes.bool,
    initialCollapsed: PropTypes.bool,
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
    isList: false,
    isListItem: false,
    isCard: false,
    isCollapsible: false,
    initialCollapsed: true,
    isHeading: false,
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
    isList,
    isListItem,
    isCard,
    isHeading,
    isCollapsible,
    initialCollapsed,
    withoutLabel,
    withoutErrors,
    labelAfter,
    className,
    labelClassName,
}) => {
    const labelBefore = !labelAfter;
    const isColumn = horizontal || inline;
    const [collapsed, setCollapsed] = useState(initialCollapsed);

    const toggleCollapsed = useCallback(() => {
        setCollapsed(!collapsed);
    }, [collapsed, setCollapsed]);

    const labelClassNames = classNames([
        styles.label,
        {
            'form-label': !inline && !isListItem,
            'col-form-label': (inline || horizontal) && !isListItem,
            'px-2': horizontal && !isListItem,
            // 'text-nowrap': horizontal, // ?
            // 'col-sm-3': horizontal, // ?
            'card-header': isCard,
            'w-100': isCard,
            'fw-bold': isHeading,
            'pt-2': isList,
            'pb-2': isList,
            'd-flex': isCollapsible,
            'align-items-center': isCollapsible,
            'justify-content-between': isCollapsible,
            'align-items-end': isListItem,
            'pe-1': isCollapsible,
            'rounded border-bottom border-light border-secondary': isCollapsible && collapsed,
            dropup: isCollapsible && !collapsed,
            [labelClassName]: labelClassName !== null,
        },
    ]);

    const innerLabel = isCollapsible ? label || null : label || null;

    const outerLabel = isCollapsible ? (
        <Button htmlFor={name} className={labelClassNames} onClick={toggleCollapsed}>
            {innerLabel}
            <FontAwesomeIcon
                style={{ width: 20 }}
                className="me-1"
                icon={collapsed ? faCaretRight : faCaretDown}
            />
        </Button>
    ) : (
        <label htmlFor={name} className={labelClassNames}>
            {innerLabel}
        </label>
    );

    const labelElement = !withoutLabel && label !== null ? outerLabel : null;

    const helpElement =
        helpText !== null ? (
            <small
                className={classNames([
                    styles.help,
                    'form-text',
                    'text-muted',
                    { 'card-body': isCard },
                ])}
            >
                {helpText}
            </small>
        ) : null;

    const errorsElement =
        !withoutErrors && errors !== null ? (
            <div
                className={classNames([
                    styles.errors,
                    'invalid-feedback',
                    'd-block',
                    { 'card-body': isCard },
                ])}
            >
                <ul className="list-unstyled">
                    {errors.map((error) => (
                        <li key={`error-${error}`}>{error}</li>
                    ))}
                </ul>
            </div>
        ) : null;

    const innerChildren = (
        <div
            className={classNames([
                {
                    'card-body': isCard,
                    collapse: isCollapsible,
                    show: isCollapsible && !collapsed,
                },
            ])}
        >
            {children}
        </div>
    );

    return (
        <div
            className={classNames([
                styles.container,
                {
                    'border-top pt-3 mt-3': isHeading,
                    'list-group-item': isListItem,
                    [className]: className !== null,
                },
            ])}
        >
            <div
                className={classNames([
                    {
                        row: isColumn,
                        card: isCard,
                        'g-0': isColumn,
                        'align-items-center': isColumn,
                        'form-floating': floating,
                    },
                ])}
            >
                {labelBefore && labelElement !== null ? (
                    <div className={classNames([{ 'col-auto': isColumn }])}>{labelElement}</div>
                ) : null}

                <div
                    className={classNames({
                        'col-auto': !isList && (isColumn || !horizontal || labelElement === null),
                        'ms-auto': isListItem && labelBefore,
                        'me-auto': isListItem && labelAfter,
                    })}
                >
                    {innerChildren}
                </div>

                {labelAfter && labelElement !== null ? (
                    <div className={classNames({ 'col-auto': isColumn })}>{labelElement}</div>
                ) : null}

                {horizontal ? (
                    <div>
                        <div className={classNames({ 'col-auto': horizontal })}>{helpElement}</div>
                        <div className={classNames({ 'col-auto': horizontal })}>
                            {errorsElement}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={classNames({ 'col-auto': horizontal })}>{helpElement}</div>
                        <div className={classNames({ 'col-auto': horizontal })}>
                            {errorsElement}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

FormGroup.defaultProps = defaultProps;
FormGroup.propTypes = propTypes;

export default FormGroup;
