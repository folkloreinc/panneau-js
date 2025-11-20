/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import isEmpty from 'lodash-es/isEmpty';
import React, { useCallback, useEffect, useState } from 'react';

import { useFieldsComponents, useLocales } from '@panneau/core/contexts';
import type { Field } from '@panneau/core/types';
import { getComponentFromName } from '@panneau/core/utils';
import Buttons from '@panneau/element-buttons';
import FormGroup from '@panneau/element-form-group';
import Label from '@panneau/element-label';

interface LocaleProperty extends Field {
    label?: string;
}

interface LocalizedFieldProps {
    name?: string | null;
    value?: Record<string, unknown> | null;
    errors?: string | string[] | null;
    label?: string | null;
    helpText?: string | null;
    component?: string | null;
    locales?: string[] | null;
    properties?: Record<string, LocaleProperty>;
    fieldComponent?: React.ComponentType<any> | null;
    fieldProps?: Record<string, unknown> | null;
    disabled?: boolean;
    className?: string | null;
    onChange?: ((value: Record<string, unknown>) => void) | null;
    onCurrentLocaleChange?: ((locale: string) => void) | null;
}

const DEFAULT_PROPERTIES: Record<string, LocaleProperty> = {};

function LocalizedField({
    name = null,
    value = null,
    errors = null,
    label = null,
    helpText = null,
    properties = DEFAULT_PROPERTIES,
    locales: parentLocales = null,
    fieldComponent: providedFieldComponent = null,
    component: componentName = null,
    fieldProps = null,
    onChange = null,
    onCurrentLocaleChange = null,
    disabled = false,
    className = null,
}: LocalizedFieldProps) {
    const contextLocales = useLocales();
    const locales = parentLocales || contextLocales;
    const Components = useFieldsComponents();

    const onFieldChange = useCallback(
        (locale: string, newFieldValue: unknown) => {
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

    useEffect(() => {
        if (onCurrentLocaleChange !== null && currentLocale !== null) {
            onCurrentLocaleChange(currentLocale);
        }
    }, [currentLocale, onCurrentLocaleChange]);

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
                        <div className="ms-auto">
                            <Buttons
                                items={locales.map((locale) => {
                                    const { label: localeLabel = null } = properties[locale] || {};
                                    return {
                                        id: locale,
                                        label: localeLabel || locale.toUpperCase(),
                                        active: locale === currentLocale,
                                        underlined: locale === currentLocale,
                                        theme:
                                            value !== null && !isEmpty(value[locale] || null)
                                                ? 'success'
                                                : 'warning',
                                        onClick: () => setCurrentLocale(locale),
                                    };
                                })}
                                theme="secondary"
                                size="sm"
                                outline
                            />
                        </div>
                    ) : null}
                </>
            }
            helpText={helpText}
            className={classNames(['mb-3', className])}
            errors={errors}
            labelClassName="d-flex align-items-center"
        >
            {locales
                .filter((locale) => locale === currentLocale)
                .map((locale) => {
                    const {
                        name: propertyName = locale,
                        component,
                        ...property
                    } = properties[locale] || {};
                    const FieldComponent =
                        providedFieldComponent ||
                        getComponentFromName(component || componentName, Components);
                    const fieldName = `${name}[${componentName}]`;
                    const fieldValue = value !== null ? value[locale] || null : null;
                    return (
                        <div key={`field-${locale}`}>
                            <FieldComponent
                                fieldLocale={locale}
                                {...(disabled === true ? { disabled } : null)}
                                {...property}
                                {...fieldProps}
                                name={propertyName || fieldName}
                                value={fieldValue}
                                errors={errors}
                                onChange={(newValue: unknown) => onFieldChange(locale, newValue)}
                            />
                        </div>
                    );
                })}
        </FormGroup>
    );
}

export default LocalizedField;
