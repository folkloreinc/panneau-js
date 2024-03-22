import React from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import Confirm from '../Confirm';

export default {
    component: Confirm,
    title: 'Modals/Confirm',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <ModalProvider>
        <Modals />
        <Confirm title="Confirm">
            <p>Are u sure?</p>
        </Confirm>
    </ModalProvider>
);
