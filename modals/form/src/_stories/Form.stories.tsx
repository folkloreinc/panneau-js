import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import fields from '../../../../.storybook/data/fields';
import Form from '../Form';

export default {
    component: Form,
    title: 'Modals/Form',
    parameters: {
        intl: true,
    },
};

export const Normal = {
    render: () => (
        <ModalProvider>
            <Modals />
            <Form fields={fields} onClose={() => {}} />
        </ModalProvider>
    ),
};
