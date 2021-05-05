/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import LocalizedField from '../Localized';
import FieldsProvider from '../../../../packages/fields';
import TextField from '../../../text/src';

export default {
    title: 'Fields/Localized',
    component: LocalizedField,
    parameters: {
        intl: true,
    },
};

const locales = ['fr', 'en'];

const Container = () => {
    const [value, setValue] = useState(Object.assign(locales));

    const onChange = (newValue) => {
        setValue(newValue);
    };

    return (
        <FieldsProvider>
            <LocalizedField
                locales={locales}
                fieldComponent={TextField}
                value={value}
                onChange={onChange}
            />
            {locales.map((locale) => (
                <div>
                    Version&nbsp;{locale}&nbsp;:&nbsp;{value[locale]}
                </div>
            ))}
        </FieldsProvider>
    );
};

const ContainerTwo = () => {
    const [value, setValue] = useState(Object.assign(locales));

    const onChange = (newValue) => {
        setValue(newValue);
    };

    return (
        <FieldsProvider>
            <LocalizedField
                locales={locales}
                component="text"
                fieldProps={{ type: 'textarea' }}
                value={value}
                onChange={onChange}
            />
            {locales.map((locale) => (
                <div>
                    Version&nbsp;{locale}&nbsp;:&nbsp;{value[locale]}
                </div>
            ))}
        </FieldsProvider>
    );
};

export const Normal = () => <Container />;
export const NormalFromContextComponents = () => <ContainerTwo />;
