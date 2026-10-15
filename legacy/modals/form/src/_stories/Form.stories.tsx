import { useState } from 'react';

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
    render: function () {
        const [opened, setOpened] = useState(true);
        return (
            <ModalProvider>
                <Modals />
                <button type="button" className="btn btn-primary" onClick={() => setOpened(true)}>
                    Open modal
                </button>
                {opened ? <Form fields={fields} onClosed={() => setOpened(false)} /> : null}
            </ModalProvider>
        );
    },
};
