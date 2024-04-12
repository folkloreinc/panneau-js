/* eslint-disable */
import React, { useState } from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import FieldsProvider from '../../../../packages/fields';
import DuplicateAction from '../DuplicateAction';

export default {
    component: DuplicateAction,
    title: 'Actions/DuplicateAction',
    parameters: {
        intl: true,
    },
};

const FieldContainer = (props) => {
    const [value, setValue] = useState([{ id: '12', name: 'Paul' }]);
    return (
        <FieldsProvider>
            <ModalProvider>
                <Modals />
                <DuplicateAction value={value} />
            </ModalProvider>
        </FieldsProvider>
    );
};

export const Normal = () => <FieldContainer label="Hello" />;
