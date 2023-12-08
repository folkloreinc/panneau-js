/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import BlocksResource from '../../../../.storybook/data/blocks-resource';
import FieldsProvider from '../../../../packages/fields';
import IntlProvider from '../../../../packages/intl/src/IntlProvider';
import { UppyProvider } from '../../../../packages/uppy/src/UppyContext';
import ItemsField from '../ItemsField';

export default {
    title: 'Fields/Items',
    component: ItemsField,
    parameters: {
        intl: true,
    },
};

const itemFieldsWithRequired = [
    { name: 'title', component: 'text', label: 'Title', required: true },
    { name: 'description', component: 'html', label: 'Description' },
];

const itemFields = [
    { name: 'title', component: 'text', label: 'Title' },
    { name: 'description', component: 'html', label: 'Description' },
];

const items = [
    { id: 1, title: 'Paul', description: 'PAUL' },
    { id: 2, title: 'John', description: '<strong>JOHN</strong>' },
    { id: 3, title: 'Ringo', description: 'RINGO' },
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
    const { value: initialValue = null } = props || {};
    const [value, setValue] = useState(initialValue);

    return (
        <FieldsProvider>
            <IntlProvider>
                <ItemsField {...props} label="Items" value={value} onChange={setValue} />
            </IntlProvider>
        </FieldsProvider>
    );
};

export const EmptyImages = () => (
    <UppyProvider>
        <Container
            itemField={{ component: 'image', components: { display: 'image' }, defaultValue: null }}
            itemComponent={null}
            newItemValue={null}
            addItemLabel="Add something"
            noItemLabel="Nothing in here"
            itemLabel="Thing"
            itemLabelPath="title"
            // value={[]}
        />
    </UppyProvider>
);

export const Normal = () => (
    <Container
        itemFields={itemFields}
        addItemLabel="Add something"
        noItemLabel="Nothing in here"
        itemLabel="Thing"
        itemLabelPath="title"
        value={items}
    />
);

export const NormalWithRequired = () => (
    <Container
        itemFields={itemFieldsWithRequired}
        addItemLabel="Add something"
        noItemLabel="Nothing in here"
        itemLabel="Thing"
        itemLabelPath="title"
        value={items}
    />
);

export const EmptyWithRequired = () => (
    <Container
        itemFields={itemFieldsWithRequired}
        addItemLabel="Add something"
        noItemLabel="Nothing in here"
        itemLabel="Thing"
        itemLabelPath="title"
        value={null}
    />
);

export const Inline = () => (
    <Container itemFields={[{ name: 'title', component: 'text', label: 'Title' }]} inline />
);

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

export const WithBlocks = () => (
    <div style={{ maxWidth: 500 }}>
        <Container types={BlocksResource.types} newItemValue={null} inline />
    </div>
);

export const WithMaxItems = () => <Container itemFields={itemFields} maxItems={2} />;

export const WithTypes = () => (
    <Container
        buttons={
            <div className="me-2">
                <button type="button">Hello</button>
            </div>
        }
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
