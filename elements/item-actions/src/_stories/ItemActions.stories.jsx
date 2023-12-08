/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import pageResource from '../../../../.storybook/data/page-resource';
import panneauDefinition from '../../../../.storybook/data/panneau-definition';
import { PanneauProvider } from '../../../../packages/core/contexts';
// import ApiProvider from '../../../../packages/data/src/contexts/ApiContext';
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
    <PanneauProvider definition={panneauDefinition}>
        <ItemActions {...props} />
    </PanneauProvider>
);

export const WithUrl = () => (
    <PanneauProvider definition={panneauDefinition}>
        <ItemActions {...props} item={{ id: '2', url: 'http://www.google.com' }} />
    </PanneauProvider>
);

export const WithShowUrl = () => (
    <PanneauProvider definition={panneauDefinition}>
        <ItemActions {...props} showUrl="http://www.google.com" />
    </PanneauProvider>
);

export const WithItems = () => (
    <PanneauProvider definition={panneauDefinition}>
        <ItemActions {...props} items={[{ id: 'My way', label: 'My button', theme: 'primary' }]} />
    </PanneauProvider>
);

export const WithActions = () => (
    <PanneauProvider definition={panneauDefinition}>
        <ItemActions
            {...props}
            actions={['select']}
            getSelectPropsFromItem={() => ({ disabled: true })}
        />
    </PanneauProvider>
);
