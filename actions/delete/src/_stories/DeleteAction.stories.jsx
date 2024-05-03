/* eslint-disable */
import React, { useState } from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import FieldsProvider from '../../../../packages/fields';
import ModalsProvider from '../../../../packages/modals/src/ModalsProvider';
import DeleteAction from '../DeleteAction';

export default {
    component: DeleteAction,
    title: 'Actions/DeleteAction',
    parameters: {
        intl: true,
    },
};

const FieldContainer = (props) => {
    const [value, setValue] = useState([{ id: '12' }]);
    return (
        <FieldsProvider>
            <ModalsProvider>
                <ModalProvider>
                    <Modals />
                    <DeleteAction value={value} {...props} />
                </ModalProvider>
            </ModalsProvider>
        </FieldsProvider>
    );
};

export const Normal = () => <FieldContainer label="Hello" withConfirmation />;
