/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import withUppy from '../../../../.storybook/decorators/withUppy';
import Upload from '../Upload';

export default {
    component: Upload,
    title: 'Modals/Upload',
    decorators: [withUppy],
    parameters: {
        intl: true,
    },
};

export const Normal = (props) => (
    <ModalProvider>
        <Modals />
        <Upload {...props} />
    </ModalProvider>
);
