/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import ModalElement from '../Modal';

export default {
    component: ModalElement,
    title: 'Elements/Modal',
    parameters: {
        intl: true,
    },
};

export const Basic = () => (
    <ModalElement>
        <div>My modaleee</div>
    </ModalElement>
);
