import { useState } from 'react';

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
