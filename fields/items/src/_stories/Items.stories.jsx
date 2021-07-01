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

const Dummy = () => <div>Hello World!</div>;

const Container = (props) => {
    const [value, setValue] = useState(null);
    return (
        <FieldsProvider>
            <IntlProvider>
                <ItemsField {...props} name="Items field" value={value} onChange={setValue} />
            </IntlProvider>
        </FieldsProvider>
    );
};

export const Normal = () => <Container itemFields={itemFields} />;
export const Inline = () => <Container itemFields={itemFields} inline />;
export const WithoutSort = () => <Container itemFields={itemFields} withoutSort />;
export const WithoutCollapse = () => <Container itemFields={itemFields} withoutCollapse />;
export const WithItemRender = () => (
    <Container renderItem={(it, index) => <div>Item #{index+1}</div>} />
);

export const WithItemComponent = () => <Container itemComponent={Dummy} />;
export const WithTypes = () => (
    <Container
        types={[
            {
                id: 'text',
                name: 'Text',
                fields: [{ component: 'text', name: 'text-plain', label: 'Texte' }],
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
