import { useState } from 'react';

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
    render: () => {
        const [opened, setOpened] = useState(true);
        return (
            <ModalProvider>
                <Modals />
                <button type="button" className="btn btn-primary" onClick={() => setOpened(true)}>
                    Open dialog
                </button>
                <Dialog id="1" title="Title" visible={opened} requestClose={() => setOpened(false)}>
                    <div>Modal content</div>
                </Dialog>
            </ModalProvider>
        );
    },
};

export const WithoutTitle = {
    render: () => {
        const [opened, setOpened] = useState(true);
        return (
            <ModalProvider>
                <Modals />
                <button type="button" className="btn btn-primary" onClick={() => setOpened(true)}>
                    Open dialog
                </button>
                <Dialog id="1" visible={opened} requestClose={() => setOpened(false)}>
                    <div>Modal content</div>
                </Dialog>
            </ModalProvider>
        );
    },
};

export const WithoutOnClose = {
    render: () => {
        const [opened, setOpened] = useState(true);
        return (
            <ModalProvider>
                <Modals />
                <button type="button" className="btn btn-primary" onClick={() => setOpened(true)}>
                    Open dialog
                </button>
                <Dialog
                    id="1"
                    title="Hello"
                    visible={opened}
                    requestClose={() => setOpened(false)}
                    withoutClose
                >
                    <div>Modal content</div>
                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => setOpened(false)}
                    >
                        Close dialog
                    </button>
                </Dialog>
            </ModalProvider>
        );
    },
};

export const WithCloseOutside = {
    render: () => {
        const [opened, setOpened] = useState(true);
        return (
            <ModalProvider>
                <Modals />
                <button type="button" className="btn btn-primary" onClick={() => setOpened(true)}>
                    Open dialog
                </button>
                <Dialog
                    id="1"
                    title="Title"
                    withCloseOutside
                    visible={opened}
                    requestClose={() => setOpened(false)}
                >
                    <div>Modal content</div>
                </Dialog>
            </ModalProvider>
        );
    },
};
