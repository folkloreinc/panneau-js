import { ModalProvider, PanneauProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import definition from '../../../../.storybook/data/definition';
import withDataProvider from '../../../../.storybook/decorators/withDataProvider';
import ResourceForm from '../ResourceForm';

export default {
    component: ResourceForm,
    title: 'Modals/ResourceForm',
    decorators: [withDataProvider],
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => (
        <PanneauProvider definition={definition}>
            <ModalProvider>
                <Modals />
                <ResourceForm resource="events" />
            </ModalProvider>
        </PanneauProvider>
    ),
};
