/* eslint-disable */
import React, { useState } from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import FieldsProvider from '../../../../packages/fields';
import RestoreAction from '../RestoreAction';

export default {
    component: RestoreAction,
    title: 'Actions/RestoreAction',
    parameters: {
        intl: true,
    },
};

const FieldContainer = (props) => {
    const [value, setValue] = useState([{ id: '12' }]);
    return (
        <FieldsProvider>
            <ModalProvider>
                <Modals />
                <RestoreAction value={value} />
            </ModalProvider>
        </FieldsProvider>
    );
};

export const Normal = () => <FieldContainer label="Hello" />;
