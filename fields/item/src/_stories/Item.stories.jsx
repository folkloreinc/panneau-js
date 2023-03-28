/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import FieldsProvider from '../../../../packages/fields';
import IntlProvider from '../../../../packages/intl/src/IntlProvider';
import ItemField from '../ItemField';

export default {
    title: 'Fields/Item',
    component: ItemField,
    parameters: {
        intl: true,
    },
};

const items = [
    { name: 'title', label: 'Title' },
    { name: 'description', label: 'Description' },
];

const Container = (props) => {
    const { value: defaultValue = null } = props || {};
    const [value, setValue] = useState(defaultValue);

    return (
        <FieldsProvider>
            <IntlProvider>
                <ItemField {...props} label="Item" value={value} onChange={setValue} />
            </IntlProvider>
        </FieldsProvider>
    );
};

export const Normal = () => <Container items={items} />;

export const Disabled = () => <Container items={items} disabled />;

export const DisabledWithValue = () => <Container items={items} value={items[0]} disabled />;
