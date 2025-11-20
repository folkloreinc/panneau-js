import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import ResourceForm from '../ResourceForm';

export default {
    component: ResourceForm,
    title: 'Modals/ResourceForm',
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => (
        <ModalProvider>
            <Modals />
            <ResourceForm resource="events" />
        </ModalProvider>
    ),
};
