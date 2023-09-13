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
    { id: 1, name: 'title', title: 'Title' },
    { id: 2, name: 'description', title: 'Description' },
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

export const Normal = () => <Container items={items} itemLabelPath="title" />;

export const NormalWithValue = () => (
    <Container items={items} value={items[1]} itemLabelPath="title" />
);

export const Multiple = () => <Container items={items} multiple itemLabelPath="title" />;

export const WithRequestUrl = () => (
    <Container requestUrl="/events/" requestQuery={null} itemLabelPath="title" autoload />
);

export const WithValueAndRequestUrl = () => (
    <Container
        requestUrl="/events/"
        requestQuery={null}
        itemLabelPath="title"
        value={{ id: '1', title: 'Title' }}
    />
);

export const WithMultipleValuesAndRequestUrl = () => (
    <Container
        requestUrl="/events/"
        requestQuery={null}
        itemLabelPath="title"
        value={[
            { id: '1', title: '1 événement' },
            { id: '2', title: '2 evt' },
        ]}
        multiple
    />
);

export const MultipleWithRequestUrl = () => (
    <Container requestUrl="/events/" requestQuery={null} itemLabelPath="title" multiple />
);

export const Disabled = () => <Container items={items} itemLabelPath="title" disabled />;

export const DisabledWithValue = () => (
    <Container items={items} value={items[1]} itemLabelPath="title" disabled />
);

export const Creatable = () => (
    <Container creatable getNewItem={(title) => ({ title })} items={items} itemLabelPath="title" />
);

export const CreatableWithRequestUrl = () => (
    <Container
        creatable
        getNewItem={(title) => ({ title })}
        requestUrl="/pages/"
        requestQuery={null}
        itemLabelPath="title"
    />
);
