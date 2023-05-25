/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import FieldsProvider from '../../../../packages/fields';
import IntlProvider from '../../../../packages/intl/src/IntlProvider';
import ItemsField from '../ItemsField';

export default {
    title: 'Fields/Items',
    component: ItemsField,
    parameters: {
        intl: true,
    },
};

const itemFields = [
    { name: 'title', component: 'text', label: 'Title' },
    { name: 'description', component: 'text', label: 'Description' },
];

const itemField = {
    name: 'artwork',
    label: '',
    type: 'object',
    component: 'item',
    required: false,
    defaultValue: null,
    settings: {
        hiddenInForm: false,
        createOnly: false,
        updateOnly: false,
    },
    properties: [],
    requestUrl: '/api/pages',
    placeholder: 'panneau.forms.pages_placeholder',
    itemLabelPath: 'title',
    itemImagePath: null,
    requestQuery: {
        paginated: false,
    },
};

const Dummy = () => <div>Hello World!</div>;

const Container = (props) => {
    const [value, setValue] = useState(null);
    return (
        <FieldsProvider>
            <IntlProvider>
                <ItemsField {...props} label="Items" value={value} onChange={setValue} />
            </IntlProvider>
        </FieldsProvider>
    );
};

export const Normal = () => (
    <Container
        itemFields={itemFields}
        addItemLabel="Add something"
        noItemLabel="Nothing in here"
        itemLabel="Thing"
        itemLabelPath="title"
    />
);
export const Inline = () => <Container itemFields={itemFields} inline />;
export const WithoutCard = () => <Container itemFields={itemFields} withoutCard />;
export const WithoutCardWithoutSort = () => (
    <Container itemFields={itemFields} withoutCard withoutSort />
);
export const InlineWithoutSort = () => <Container itemFields={itemFields} inline withoutSort />;
export const WithoutSort = () => <Container itemFields={itemFields} withoutSort />;
export const WithoutCollapse = () => <Container itemFields={itemFields} withoutCollapse />;
export const WithItemRender = () => (
    <Container renderItem={(it, index) => <div>Item #{index + 1}</div>} />
);

export const WithItemComponent = () => <Container itemComponent={Dummy} />;
export const WithFieldComponent = () => <Container itemField={itemField} newItemValue={null} />;
export const WithMaxItems = () => <Container itemFields={itemFields} maxItems={2} />;

export const WithTypes = () => (
    <Container
        types={[
            {
                id: 'text',
                name: 'Text',
                fields: [{ component: 'text', type: 'editor', name: 'text-plain', label: 'Texte' }],
            },
            {
                id: 'html',
                name: 'HTML',
                fields: [{ component: 'html', name: 'text-html', label: 'Texte html' }],
            },
            {
                id: 'text-localized',
                name: 'Text-Localized',
                fields: [
                    {
                        component: 'localized',
                        name: 'text-with-locale',
                        label: 'Texte localized',
                        withoutFormGroup: true,
                        properties: {
                            fr: {
                                name: 'fr',
                                label: 'Fr',
                                component: 'text',
                            },
                            en: {
                                name: 'en',
                                label: 'En',
                                component: 'text',
                            },
                        },
                    },
                ],
            },
            {
                id: 'image',
                name: 'Machin',
                fields: [
                    {
                        component: 'localized',
                        name: 'text-with-locale',
                        label: 'Machin',
                        properties: {
                            fr: {
                                name: 'fr',
                                label: 'Fr',
                                component: 'text',
                            },
                            en: {
                                name: 'en',
                                label: 'En',
                                component: 'text',
                            },
                        },
                    },
                ],
            },
        ]}
    />
);
