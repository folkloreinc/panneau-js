/* eslint-disable */
import React, { useState } from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import FieldsProvider from '../../../../packages/fields';
import ModalsProvider from '../../../../packages/modals/src/ModalsProvider';
import ShowAction from '../ShowAction';

export default {
    component: ShowAction,
    title: 'Actions/ShowAction',
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
                    <ShowAction value={value} {...props} />
                </ModalProvider>
            </ModalsProvider>
        </FieldsProvider>
    );
};

export const Normal = () => <FieldContainer label="Hello" withConfirmation />;
