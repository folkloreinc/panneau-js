/* eslint-disable */
import React, { useState } from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import FieldsProvider from '../../../../packages/fields';
import ModalsProvider from '../../../../packages/modals/src/ModalsProvider';
import ImportAction from '../ImportAction';

export default {
    component: ImportAction,
    title: 'Actions/ImportAction',
    parameters: {
        intl: true,
    },
};

const template = {
    columns: [
        {
            name: 'First Name',
            key: 'first_name',
            required: true,
            description: 'The first name of the user',
            suggested_mappings: ['First', 'Name'],
        },
        {
            name: 'Age',
            data_type: 'number',
        },
    ],
};

const FieldContainer = (props) => {
    const [value, setValue] = useState([{ id: '12' }]);
    return (
        <FieldsProvider>
            <ModalsProvider>
                <ModalProvider>
                    <Modals />
                    <ImportAction value={value} template={template} {...props} />
                </ModalProvider>
            </ModalsProvider>
        </FieldsProvider>
    );
};

export const Normal = () => <FieldContainer label="Welcome to csv" withConfirmation />;
