/* eslint-disable */
import React, { useState } from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import withApi from '../../../../.storybook/decorators/withApiProvider';
import withUppy from '../../../../.storybook/decorators/withUppy';
import FieldsProvider from '../../../../packages/fields';
import ModalsProvider from '../../../../packages/modals/src/ModalsProvider';
import UploadAction from '../UploadAction';

export default {
    component: UploadAction,
    title: 'Actions/UploadAction',
    decorators: [withUppy, withApi],
    parameters: {
        intl: true,
    },
};

const FieldContainer = (props) => {
    const [value, setValue] = useState(null);
    return (
        <FieldsProvider>
            <ModalsProvider>
                <ModalProvider>
                    <Modals />
                    <UploadAction {...props} name="button" value={value} onChange={setValue} />
                </ModalProvider>
            </ModalsProvider>
        </FieldsProvider>
    );
};

export const Normal = () => <FieldContainer label="Upload me" />;
