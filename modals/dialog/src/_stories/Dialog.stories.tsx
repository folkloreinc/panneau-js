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

export const Normal = {
    render: () => (
        <ModalProvider>
            <Modals />
            <Dialog id="1" title="Hello" onClose={() => {}}>
                <div>Modal content</div>
            </Dialog>
        </ModalProvider>
    ),
};

export const WithoutTitle = {
    render: () => (
        <ModalProvider>
            <Modals />
            <Dialog id="1" onClose={() => {}}>
                <div>Modal content</div>
            </Dialog>
        </ModalProvider>
    ),
};

export const WithoutOnClose = {
    render: () => (
        <ModalProvider>
            <Modals />
            <Dialog id="1" title="Hello">
                <div>Modal content</div>
            </Dialog>
        </ModalProvider>
    ),
};

export const WithCloseOutside = {
    render: () => (
        <ModalProvider>
            <Modals />
            <Dialog id="1" title="Hello" withCloseOutside>
                <div>Modal content</div>
            </Dialog>
        </ModalProvider>
    ),
};
