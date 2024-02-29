import React from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import pageResource from '../../../../.storybook/data/page-resource';
import withApi from '../../../../.storybook/decorators/withApiProvider';
import { ResourceProvider } from '../../../../packages/core/src/contexts';
import ResourceItems from '../ResourceItems';

export default {
    component: ResourceItems,
    title: 'Modals/ResourceItems',
    decorators: [withApi],
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <ModalProvider>
        <Modals />
        <ResourceProvider resource={pageResource}>
            <ResourceItems resource="pages" />
        </ResourceProvider>
    </ModalProvider>
);
