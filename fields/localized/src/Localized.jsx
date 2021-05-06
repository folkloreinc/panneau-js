/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
// import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';

import Buttons from '@panneau/element-buttons';
import Label from '@panneau/element-label';
import FormGroup from '@panneau/element-form-group';
import { useFieldsComponents, useLocales } from '@panneau/core/contexts';
import { getComponentFromName } from '@panneau/core/utils';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.object, // eslint-disable-line
    label: PropTypes.string,
    component: PropTypes.string,
    locales: PropTypes.arrayOf(PropTypes.string),
    properties: PropTypes.objectOf(PanneauPropTypes.field),
    fieldComponent: PropTypes.elementType,
    fieldProps: PropTypes.object, // eslint-disable-line
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    name: null,
    value: null,
    label: null,
    component: null,
    locales: null,
    properties: {},
    fieldComponent: null,
    fieldProps: null,
    className: null,
    onChange: null,
};

const LocalizedField = ({
    name,
    value,
    label,
    properties,
    locales: parentLocales,
    fieldComponent: providedFieldComponent,
    component: componentName,
    fieldProps,
    onChange,
    className,
}) => {
    const contextLocales = useLocales();
    const locales = parentLocales || contextLocales;
    const Components = useFieldsComponents();

    const onFieldChange = useCallback(
        (locale, newFieldValue) => {
            const newValue = {
                ...value,
                [locale]: newFieldValue,
            };
            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange, value],
    );
    const [currentLocale, setCurrentLocale] = useState(locales.length > 0 ? locales[0] : null);
    return (
        <FormGroup
            label={
                <>
                    {label !== null ? (
                        <span className="me-2">
                            <Label>{label}</Label>
                        </span>
                    ) : null}
                    {locales.length > 1 ? (
                        <div className="ml-auto">
                            <Buttons
                                items={locales.map((locale) => ({
                                    id: locale,
                                    label: locale.toUpperCase(),
                                    active: locale === currentLocale,
                                    theme:
                                        value !== null && !isEmpty(value[locale] || null)
                                            ? 'success'
                                            : 'warning',
                                    onClick: () => setCurrentLocale(locale),
                                }))}
                                theme="secondary"
                                size="sm"
                                outline
                            />
                        </div>
                    ) : null}
                </>
            }
            className={className}
            labelClassName="d-flex align-items-center"
        >
            {locales
                .filter((locale) => locale === currentLocale)
                .map((locale) => {
                    const { name: propertyName = locale, component, ...property } =
                        properties[locale] || {};
                    const FieldComponent =
                        providedFieldComponent ||
                        getComponentFromName(component || componentName, Components);
                    const fieldName = `${name}[${componentName}]`;
                    const fieldValue = value !== null ? value[locale] || null : null;
                    return (
                        <div key={`field-${locale}`}>
                            <FieldComponent
                                {...property}
                                {...fieldProps}
                                name={propertyName || fieldName}
                                value={fieldValue}
                                onChange={(newValue) => onFieldChange(locale, newValue)}
                            />
                        </div>
                    );
                })}
        </FormGroup>
    );
};

LocalizedField.propTypes = propTypes;
LocalizedField.defaultProps = defaultProps;

export default LocalizedField;
