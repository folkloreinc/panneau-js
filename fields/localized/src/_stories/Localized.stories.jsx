/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import FieldsProvider from '../../../../packages/fields';
import IntlProvider from '../../../../packages/intl/src/IntlProvider';
import HtmlField from '../../../html/src';
import TextField from '../../../text/src';
import LocalizedField from '../Localized';

export default {
    title: 'Fields/Localized',
    component: LocalizedField,
    parameters: {
        intl: true,
    },
};

const locales = ['fr', 'en', 'jp'];

const Container = (props = null) => {
    const { component = null, locales: containerLocales = null } = props || {};
    const finalLocales = containerLocales || locales;

    const [value, setValue] = useState(Object.assign(finalLocales));
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
                    <div>
                        Version&nbsp;{locale}&nbsp;:&nbsp;{value[locale]}
                    </div>
                ))}
            </IntlProvider>
        </FieldsProvider>
    );
};

const ContainerTwo = (props = null) => {
    const [value, setValue] = useState(Object.assign(locales));
    const onChange = (newValue) => {
        setValue(newValue);
    };

    return (
        <FieldsProvider>
            <IntlProvider locale="en" locales={locales}>
                <LocalizedField
                    component="text"
                    fieldProps={{ type: 'textarea' }}
                    value={value}
                    onChange={onChange}
                    {...props}
                />
                {locales.map((locale) => (
                    <div>
                        Version&nbsp;{locale}&nbsp;:&nbsp;{value[locale]}
                    </div>
                ))}
            </IntlProvider>
        </FieldsProvider>
    );
};

export const Normal = () => <Container />;

export const NormalFromContextComponents = () => <ContainerTwo />;

export const NormalDisabled = () => <ContainerTwo disabled />;

export const Html = () => <Container locales={['fr', 'en', 'wendat']} component={HtmlField} />;
