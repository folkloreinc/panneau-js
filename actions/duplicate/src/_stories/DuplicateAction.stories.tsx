/* eslint-disable */
import React, { useState } from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import FieldsProvider from '../../../../packages/fields/src/FieldsProvider';
import ModalsProvider from '../../../../packages/modals/src/ModalsProvider';
import DuplicateAction from '../DuplicateAction';

export default {
    component: DuplicateAction,
    title: 'Actions/DuplicateAction',
    parameters: {
        intl: true,
    },
};

function FieldContainer(props) {
    const [value, setValue] = useState([{ id: '12', name: 'Paul' }]);
    return (
        <FieldsProvider>
            <ModalsProvider>
                <ModalProvider>
                    <Modals />
                    <DuplicateAction value={value} {...props} />
                </ModalProvider>
            </ModalsProvider>
        </FieldsProvider>
    );
}

export const Normal = {
    render: function () {
        return <FieldContainer label="Hello" withConfirmation />;
    },
};
