/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import get from 'lodash/get';
import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { ButtonGroup } from '@panneau/core/components';
import { useDefinition } from '@panneau/core/contexts';
import { FormGroup } from '@panneau/field';

import styles from './styles.scss';

const propTypes = {
    name: PropTypes.string,
    label: PanneauPropTypes.label,
    helpText: PropTypes.string,
    value: PropTypes.object, // eslint-disable-line
    onChange: PropTypes.func,
    locale: PropTypes.string,
    className: PropTypes.string,
    locales: PropTypes.arrayOf(PropTypes.string),
    FieldComponent: PropTypes.elementType,
    getFieldProps: PropTypes.func,
    renderField: PropTypes.func,
    children: PropTypes.func,
};

const defaultProps = {
    name: 'locale',
    label: null,
    helpText: null,
    value: null,
    onChange: null,
    locale: null,
    locales: null,
    className: 'form-group-locale',
    FieldComponent: null,
    getFieldProps: null,
    renderField: null,
    children: null,
};

const defaultLocales = ['en'];

const LocaleField = ({
    name,
    label,
    value,
    className,
    locale: initialLocale,
    locales: propsLocales,
    helpText,
    onChange,
    renderField,
    children,
    FieldComponent,
    getFieldProps,
    ...props
}) => {
    const definition = useDefinition();
    const contextLocales = definition.locales();
    const locales = propsLocales || contextLocales || defaultLocales;
    const [currentLocale, setCurrentLocale] = useState(
        initialLocale || (locales.length > 0 ? locales[1] : null),
    );
    const labelSuffix =
        locales.length > 1 ? (
            <ButtonGroup
                size="sm"
                toggle
                className="ml-2"
                buttons={locales.map(locale => ({
                    label: locale.toUpperCase(),
                    active: currentLocale === locale,
                    style: !isEmpty(get(value, locale)) ? 'outline-secondary' : 'warning',
                    onClick: () => setCurrentLocale(locale),
                }))}
            />
        ) : null;

    const propsWithoutErrors = omit(props, 'errors');

    return (
        <FormGroup
            label={label}
            labelSuffix={labelSuffix}
            className={classNames([styles.formGroup, {
                [styles.withLocales]: locales.length > 1,
                [className]: className !== null,
            }])}
            {...propsWithoutErrors}
        >
            {locales.map((locale, index) => {
                const fieldProps = {
                    ...props,
                    onChange: newFieldValue => {
                        const newValue = {
                            ...value,
                            [locale]: newFieldValue,
                        };

                        if (onChange !== null) {
                            const allValuesNull = Object.keys(newValue).reduce(
                                (allNull, k) => allNull && newValue[k] === null,
                                true,
                            );
                            onChange(!allValuesNull ? newValue : null);
                        }
                    },
                    name: `${name}[${locale}]`,
                    value: value !== null ? value[locale] || null : null,
                    withoutMargin: true,
                };
                const customProps =
                    getFieldProps !== null ? getFieldProps(locale, fieldProps) : null;
                const finalProps = {
                    ...fieldProps,
                    ...customProps,
                };
                const renderFieldMethod = renderField || children || null;
                return (
                    <div
                        key={`input_${locale}`}
                        className="form-group-locale-field"
                        style={{
                            display: currentLocale === locale ? 'block' : 'none',
                        }}
                    >
                        {renderFieldMethod !== null ? (
                            renderFieldMethod(locale, finalProps, FieldComponent, index)
                        ) : (
                            <FieldComponent {...finalProps} />
                        )}
                    </div>
                );
            })}
        </FormGroup>
    );
};

LocaleField.defaultLocales = defaultLocales;
LocaleField.propTypes = propTypes;
LocaleField.defaultProps = defaultProps;

export default LocaleField;
