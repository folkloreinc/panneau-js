import { useCallback, useState } from 'react';

import withApi from '../../../../.storybook/decorators/withDataProvider';
import FieldsProvider from '../../../../packages/fields/src';
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

function Container(props) {
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
}

export const Normal = {
    render: () => <Container items={items} itemLabelPath="title" />,
};

export const NormalWithValue = {
    render: () => <Container items={items} value={items[1]} itemLabelPath="title" />,
};

export const Multiple = {
    render: () => <Container items={items} multiple itemLabelPath="title" />,
};

export const WithRequestUrl = {
    render: () => (
        <Container requestUrl="/api/events" requestQuery={null} itemLabelPath="title.fr" autoload />
    ),
};

export const WithValueAndRequestUrl = {
    render: () => (
        <Container
            requestUrl="/api/events"
            requestQuery={null}
            itemLabelPath="title.fr"
            value={{ id: '1', title: { fr: 'Soirée d’ouverture' } }}
        />
    ),
};

export const WithMultipleValuesAndRequestUrl = {
    render: () => (
        <Container
            requestUrl="/api/events"
            requestQuery={null}
            itemLabelPath="title.fr"
            value={[
                { id: '1', title: { fr: 'Soirée d’ouverture' } },
                { id: '2', title: { fr: 'Les villes de demain' } },
            ]}
            multiple
        />
    ),
};

export const MultipleWithRequestUrl = {
    render: () => (
        <Container requestUrl="/api/events" requestQuery={null} itemLabelPath="title.fr" multiple />
    ),
};

export const Disabled = {
    render: () => <Container items={items} itemLabelPath="title" disabled />,
};

export const DisabledWithValue = {
    render: () => <Container items={items} value={items[1]} itemLabelPath="title" disabled />,
};

export const Creatable = {
    render: () => (
        <Container
            creatable
            getNewItem={(title) => ({ title })}
            items={items}
            itemLabelPath="title"
        />
    ),
};

export const CreatableWithRequestUrl = {
    render: () => (
        <Container
            creatable
            multiple
            getNewItem={(title) => ({ title: { fr: title } })}
            requestUrl="/api/pages"
            requestQuery={null}
            itemLabelPath="title.fr"
        />
    ),
};
