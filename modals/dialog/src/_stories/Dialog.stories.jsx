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
        <Dialog title="Hello" onClose={() => {}}>
            <div>Modal content</div>
        </Dialog>
    </ModalProvider>
);

export const WithoutTitle = () => (
    <ModalProvider>
        <Modals />
        <Dialog onClose={() => {}}>
            <div>Modal content</div>
        </Dialog>
    </ModalProvider>
);

export const WithoutOnClose = () => (
    <ModalProvider>
        <Modals />
        <Dialog title="Hello">
            <div>Modal content</div>
        </Dialog>
    </ModalProvider>
);

export const WithCloseOutside = () => (
    <ModalProvider>
        <Modals />
        <Dialog title="Hello" withCloseOutside>
            <div>Modal content</div>
        </Dialog>
    </ModalProvider>
);
