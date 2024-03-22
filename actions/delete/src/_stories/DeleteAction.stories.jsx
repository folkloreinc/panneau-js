/* eslint-disable */
import React, { useState } from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import FieldsProvider from '../../../../packages/fields';
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
            <ModalProvider>
                <Modals />
                <DeleteAction value={value} />
            </ModalProvider>
        </FieldsProvider>
    );
};

export const Normal = () => <FieldContainer label="Hello" />;
