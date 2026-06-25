import { useCallback, useState } from 'react';

import { ModalProvider, ResourceProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';
import ListsProvider from '@panneau/lists';

import pageResource from '../../../../.storybook/data/page-resource';
// import { Modals } from '@panneau/element-modal';
import panneauDefinition from '../../../../.storybook/data/panneau-definition';
// import pageResource from '../../../../.storybook/data/page-resource';
import withApi from '../../../../.storybook/decorators/withDataProvider';
// import { ApiProvider } from '../../../../packages/data/src/contexts/ApiContext';
import FieldsProvider from '../../../../packages/fields';
// import IntlProvider from '../../../../packages/intl/src/IntlProvider';
import ResourceItemField from '../ResourceItemField';

export default {
    title: 'Fields/ResourceItem',
    component: ResourceItemField,
    decorators: [withApi],
    parameters: {
        intl: true,
    },
};

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
        <ModalProvider>
            <FieldsProvider>
                <ListsProvider>
                    <Modals />
                    <ResourceItemField {...props} label="Item" value={value} onChange={onChange} />
                </ListsProvider>
            </FieldsProvider>
        </ModalProvider>
    );
}

export const Normal = {
    render: () => <Container resource={pageResource} />,
};

export const Multiple = {
    render: () => <Container resource={pageResource} multiple />,
};

export const Disabled = {
    render: () => <Container resource={pageResource} disabled />,
};

export const DisabledWithValue = {
    render: () => <Container resource={pageResource} value={{ id: '1' }} disabled />,
};

export const DisabledWithValues = {
    render: () => (
        <Container resource={pageResource} value={[{ id: '1' }, { id: 2 }]} disabled multiple />
    ),
};

export const CanCreate = {
    render: () => <Container resource={pageResource} canFind canCreate />,
};

export const CanCreateInPlace = {
    render: () => <Container resource={pageResource} canCreate createInPlace />,
};

export const CanCreateMultiple = {
    render: () => <Container resource={pageResource} canCreate multiple />,
};
