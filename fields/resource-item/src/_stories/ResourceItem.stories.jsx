/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useState } from 'react';

import panneauDefinition from '../../../../.storybook/data/panneau-definition';
// import pageResource from '../../../../.storybook/data/page-resource';
import withApi from '../../../../.storybook/decorators/withApiProvider';
import { PanneauProvider } from '../../../../packages/core/contexts';
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
        <PanneauProvider definition={panneauDefinition}>
            <FieldsProvider>
                <ResourceItemField {...props} label="Item" value={value} onChange={onChange} />
            </FieldsProvider>
        </PanneauProvider>
    );
};

export const Normal = () => <Container resource="pages" />;

export const Multiple = () => <Container resource="pages" multiple />;

export const Disabled = () => <Container resource="pages" disabled />;

export const DisabledWithValue = () => <Container resource="pages" value={{ id: '1' }} disabled />;

export const DisabledWithValues = () => (
    <Container resource="pages" value={[{ id: '1' }, { id: 2 }]} disabled multiple />
);

export const CanCreate = () => <Container resource="pages" canCreate />;

export const CanCreateMultiple = () => <Container resource="pages" canCreate multiple />;
