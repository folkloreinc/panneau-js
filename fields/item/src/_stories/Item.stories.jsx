/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useState } from 'react';

import withApi from '../../../../.storybook/decorators/withApiProvider';
import FieldsProvider from '../../../../packages/fields';
import IntlProvider from '../../../../packages/intl/src/IntlProvider';
import ItemField from '../ItemField';

export default {
    title: 'Fields/Item',
    component: ItemField,
    decorators: [withApi],
    parameters: {
        intl: true,
    },
};

const items = [
    { id: 1, name: 'title', label: 'Title' },
    { id: 2, name: 'description', label: 'Description' },
];

const Container = (props) => {
    const { value: defaultValue = null } = props || {};
    const [value, setValue] = useState(defaultValue);
    const onChange = useCallback(
        (newValue) => {
            setValue(newValue);
        },
        [setValue],
    );
    return (
        <FieldsProvider>
            <IntlProvider>
                <ItemField {...props} label="Item" value={value} onChange={onChange} />
            </IntlProvider>
        </FieldsProvider>
    );
};

export const Normal = () => <Container items={items} />;

export const Multiple = () => <Container items={items} multiple />;

export const WithRequestUrl = () => (
    <Container requestUrl="/events/" requestQuery={null} itemLabelPath="title" autoload />
);

export const WithValueAndRequestUrl = () => (
    <Container
        requestUrl="/events/"
        requestQuery={null}
        itemLabelPath="title"
        value={[{ id: '1', label: 'Title' }]}
        multiple
    />
);

export const MultipleWithRequestUrl = () => (
    <Container requestUrl="/events/" requestQuery={null} itemLabelPath="title" multiple />
);

export const Disabled = () => <Container items={items} disabled />;

export const DisabledWithValue = () => <Container items={items} value={items[0]} disabled />;

export const Creatable = () => (
    <Container
        creatable
        onCreate={(newValue) => {
            console.log(newValue);
        }}
        requestUrl="/pages/"
        requestQuery={null}
        itemLabelPath="title"
    />
);
