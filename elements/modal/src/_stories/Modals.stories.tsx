import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import ModalElement from '../Modal';

export default {
    component: ModalElement,
    title: 'Elements/Modal',
    parameters: {
        intl: true,
    },
    decorators: [
        (Story) => (
            <div style={{ width: '100vh', height: '100vw' }}>
                <ModalProvider>
                    <Story />
                    <Modals />
                </ModalProvider>
            </div>
        ),
    ],
};

export const Basic = {
    render: function () {
        const [show, setShow] = useState(false);
        return (
            <div>
                <button type="button" className="btn btn-primary" onClick={() => setShow(true)}>
                    Open modal
                </button>
                <ModalElement visible={show}>
                    <div className="modal-dialog" style={{ width: 300, height: 200 }}>
                        <div className="modal-content">
                            <div className="modal-body">
                                <p>My modal</p>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => setShow(false)}
                                >
                                    Close modal
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalElement>
            </div>
        );
    },
};

export const Multiple = {
    render: function () {
        const [show, setShow] = useState(false);
        const [showSecond, setShowSecond] = useState(false);
        return (
            <div>
                <button type="button" className="btn btn-primary" onClick={() => setShow(true)}>
                    Open modal 1
                </button>
                <ModalElement visible={show} withoutBackdrop>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-body">
                                <p>My modal</p>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setShowSecond(true)}
                                >
                                    Open modal 2
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => setShow(false)}
                                >
                                    Close modal 1
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalElement>
                <ModalElement visible={showSecond}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-body">
                                <p>Second modal</p>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => setShowSecond(false)}
                                >
                                    Close modal 2
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalElement>
            </div>
        );
    },
};

// A modal with a backdrop opened over another one (ex.: a confirmation over a form) dims the
// modal under it with its own backdrop
function StackedModals() {
    const [show, setShow] = useState(false);
    const [showSecond, setShowSecond] = useState(false);
    return (
        <div>
            <button type="button" className="btn btn-primary" onClick={() => setShow(true)}>
                Open modal 1
            </button>
            <ModalElement id="first-modal" visible={show}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-body">
                            <p>My modal</p>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setShowSecond(true)}
                            >
                                Open modal 2
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => setShow(false)}
                            >
                                Close modal 1
                            </button>
                        </div>
                    </div>
                </div>
            </ModalElement>
            <ModalElement id="second-modal" visible={showSecond}>
                <div className="modal-dialog modal-dialog-centered modal-sm">
                    <div className="modal-content">
                        <div className="modal-body">
                            <p>Second modal</p>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => setShowSecond(false)}
                            >
                                Close modal 2
                            </button>
                        </div>
                    </div>
                </div>
            </ModalElement>
        </div>
    );
}

export const Stacked = {
    render: () => <StackedModals />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        // A modal closed before it has faded in never ends its transition, so wait for it
        const clickModalButton = async (name: string) => {
            const button = await canvas.findByRole('button', { name });
            await waitFor(() =>
                expect(getComputedStyle(button.closest('.modal')).opacity).toBe('1'),
            );
            await userEvent.click(button);
        };
        await userEvent.click(canvas.getByRole('button', { name: 'Open modal 1' }));
        await clickModalButton('Open modal 2');
        await canvas.findByText('Second modal');

        const [firstModal, secondModal] = canvas.getAllByRole('dialog');
        // The first modal is dimmed by the backdrop of <Modals>, the second by its own
        await expect(firstModal.querySelector(':scope > .modal-backdrop')).toBeNull();
        await expect(secondModal.querySelector(':scope > .modal-backdrop')).not.toBeNull();

        await clickModalButton('Close modal 2');
        await waitFor(() => expect(canvas.queryByText('Second modal')).toBeNull());
    },
};
