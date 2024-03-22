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

// eslint-disable-next-line react/prop-types
const Container = ({ children }) => (
    <ModalProvider>
        <Modals />
        <ResourceProvider resource={pageResource}>{children}</ResourceProvider>
    </ModalProvider>
);

export const Normal = () => (
    <Container>
        <ResourceItems resource={pageResource} />
    </Container>
);
