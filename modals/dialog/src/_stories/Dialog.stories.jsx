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
        <Dialog id="1" title="Hello" onClose={() => {}}>
            <div>Modal content</div>
        </Dialog>
    </ModalProvider>
);

export const WithoutTitle = () => (
    <ModalProvider>
        <Modals />
        <Dialog id="1" onClose={() => {}}>
            <div>Modal content</div>
        </Dialog>
    </ModalProvider>
);

export const WithoutOnClose = () => (
    <ModalProvider>
        <Modals />
        <Dialog id="1" title="Hello">
            <div>Modal content</div>
        </Dialog>
    </ModalProvider>
);

export const WithCloseOutside = () => (
    <ModalProvider>
        <Modals />
        <Dialog id="1" title="Hello" withCloseOutside>
            <div>Modal content</div>
        </Dialog>
    </ModalProvider>
);
