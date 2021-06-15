/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import pageResource from '../../../../.storybook/data/page-resource';
import { ResourceProvider } from '../../../../packages/core/contexts';
import ItemActions from '../ItemActions';

export default {
    component: ItemActions,
    title: 'Elements/ItemActions',
    parameters: {
        intl: true,
    },
};

const props = {
    resource: pageResource,
    item: {
        id: 1,
    },
    size: 'sm',
};

export const Normal = () => (
    <ResourceProvider resource={pageResource}>
        <ItemActions {...props} />
    </ResourceProvider>
);
