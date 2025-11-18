/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import FieldsProvider from '../../../../packages/fields';
import IntlProvider from '../../../../packages/intl/src/IntlProvider';
import HtmlField from '../../../html/src';
import TextField from '../../../text/src';
import LocalizedField from '../LocalizedField';

export default {
    title: 'Fields/Localized',
    component: LocalizedField,
    parameters: {
        intl: true,
    },
};

const defaultLocales = ['fr', 'en', 'jp'];
const defaultValue = defaultLocales.reduce(
    (acc, it) => ({
        ...acc,
        [it]: 'Valeur',
    }),
    {},
);

function Container(props = null) {
    const { component = null, locales: containerLocales = null } = props || {};
    const finalLocales = containerLocales || defaultLocales;
    const [value, setValue] = useState(defaultValue);
    const onChange = (newValue) => {
        setValue(newValue);
    };
    return (
        <FieldsProvider>
            <IntlProvider locale="fr" locales={finalLocales}>
                <LocalizedField
                    fieldComponent={component || TextField}
                    value={value}
                    onChange={onChange}
                    {...props}
                />
                {finalLocales.map((locale) => (
                    <div key={`version-${locale}`}>
                        Version&nbsp;{locale}&nbsp;:&nbsp;{value[locale] || ''}
                    </div>
                ))}
            </IntlProvider>
        </FieldsProvider>
    );
};

function ContainerCustom(props = null) {
    const [value, setValue] = useState(defaultValue);
    const onChange = (newValue) => {
        setValue(newValue);
    };
    return (
        <FieldsProvider>
            <IntlProvider locale="en" locales={defaultLocales}>
                <LocalizedField
                    component="text"
                    fieldProps={{ type: 'textarea' }}
                    value={defaultValue}
                    onChange={onChange}
                    {...props}
                />
                {defaultLocales.map((locale) => (
                    <div key={`version-${locale}`}>
                        Version&nbsp;{locale}&nbsp;:&nbsp;{value[locale]}
                    </div>
                ))}
            </IntlProvider>
        </FieldsProvider>
    );
};

export const Normal = {
    render: () => <Container />,
};

export const NormalFromContextComponents = {
    render: () => <ContainerCustom />,
};

export const NormalDisabled = {
    render: () => <ContainerCustom disabled />,
};

export const Html = {
    render: () => <Container locales={['fr', 'en', 'wendat']} fieldComponent={HtmlField} />,
};