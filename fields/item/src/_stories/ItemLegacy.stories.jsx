/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useState } from 'react';

import withApi from '../../../../.storybook/decorators/withApiProvider';
import FieldsProvider from '../../../../packages/fields';
import IntlProvider from '../../../../packages/intl/src/IntlProvider';

import ItemFieldLegacy from '../ItemField.legacy';

export default {
    title: 'Fields/ItemLegacy',
    component: ItemFieldLegacy,
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
            console.log('newValue', newValue);
            setValue(newValue);
        },
        [setValue],
    );
    return (
        <FieldsProvider>
            <IntlProvider>
                <ItemFieldLegacy {...props} label="Item" value={value} onChange={onChange} />
            </IntlProvider>
        </FieldsProvider>
    );
};

export const Normal = () => <Container items={items} />;

export const WithRequestUrl = () => (
    <Container requestUrl="/events" requestQuery={null} itemLabelPath="title" autoload />
);

export const Disabled = () => <Container items={items} disabled />;

export const DisabledWithValue = () => <Container items={items} value={items[0]} disabled />;
