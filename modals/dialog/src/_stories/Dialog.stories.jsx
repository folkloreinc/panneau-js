import React from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import Dialog from '../Dialog';

export default {
    component: Dialog,
    title: 'Modals/Dialog',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <ModalProvider>
        <Modals />
        <Dialog title="Hello">
            <div>Helloooooo</div>
        </Dialog>
    </ModalProvider>
);
