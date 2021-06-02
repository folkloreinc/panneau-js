/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import ItemsField from '../ItemsField';

import FieldsProvider from '../../../../packages/fields';

export default {
    title: 'Fields/Items',
    component: ItemsField,
    parameters: {
        intl: true,
    },
};

const itemFields = [{ name: 'title', component: 'text', label: 'Title' }];

const Dummy = () => <div>Hello World!</div>

const Container = (props) => {
    const [value, setValue] = useState(null);
    return (
        <FieldsProvider>
            <ItemsField {...props} name="Fields/Items" value={value} onChange={setValue} />
        </FieldsProvider>
    );
};

export const Normal = () => <Container itemFields={ itemFields } />;

export const WithoutSort = () => <Container itemFields={ itemFields } withoutSort />;

export const WithoutCollapse = () => <Container itemFields={ itemFields } withoutCollapse />;

export const WithItemRender = () => (
    <Container
        itemFields={ itemFields }
        renderItem={ (it, index, { children }) => {
            return (<div style={{ transform: 'rotate(3deg)' }}>{ children }</div>)
        } }
    />
);

export const WithItemComponent = () => <Container itemComponent={ Dummy } />;
