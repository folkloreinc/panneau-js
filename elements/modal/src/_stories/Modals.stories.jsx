/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

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

export const Basic = () => (
    <ModalElement>
        <div style={{ width: 300, height: 200, color: 'white', backgroundColor: 'black' }}>
            My modal
        </div>
    </ModalElement>
);

export const WithClose = () => {
    const [show, setShow] = useState(true);
    return show ? (
        <ModalElement onClose={() => setShow(!show)}>
            <div
                style={{
                    width: 300,
                    height: 200,
                    color: 'white',
                    backgroundColor: 'black',
                    pointerEvents: 'none',
                    zIndex: 10000,
                }}
            >
                My modal
            </div>
        </ModalElement>
    ) : null;
};
