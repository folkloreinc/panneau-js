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
        id: '1',
    },
    size: 'sm',
};

export const Normal = () => (
    <ResourceProvider resource={pageResource}>
        <ItemActions {...props} />
    </ResourceProvider>
);

export const WithUrl = () => (
    <ResourceProvider resource={pageResource}>
        <ItemActions {...props} item={{ id: '2', url: 'http://www.google.com' }} />
    </ResourceProvider>
);

export const WithShowUrl = () => (
    <ResourceProvider resource={pageResource}>
        <ItemActions {...props} showUrl="http://www.google.com" />
    </ResourceProvider>
);

export const WithItems = () => (
    <ResourceProvider resource={pageResource}>
        <ItemActions {...props} items={[{ id: 'My way', label: 'My button', theme: 'primary' }]} />
    </ResourceProvider>
);
