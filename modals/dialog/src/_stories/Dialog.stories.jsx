import React from 'react';

import Dialog from '../Dialog';

export default {
    component: Dialog,
    title: 'Modals/Dialog',
    parameters: {
        intl: true,
    },
};

export const Normal = () => <Dialog title="Hello" />;
