/* eslint-disable */
import { useState } from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import FieldsProvider from '../../../../packages/fields/src/FieldsProvider';
import ModalsProvider from '../../../../packages/modals/src/ModalsProvider';
import EditAction from '../EditAction';

export default {
    component: EditAction,
    title: 'Actions/EditAction',
    parameters: {
        intl: true,
    },
};

function ActionContainer({ value: initialValue, ...props }) {
    const [value, setValue] = useState(initialValue);
    return (
        <FieldsProvider>
            <ModalsProvider>
                <ModalProvider>
                    <Modals />
                    <EditAction {...props} value={value} onChange={setValue} />
                </ModalProvider>
            </ModalsProvider>
        </FieldsProvider>
    );
}

export const Normal = {
    render: function () {
        return (
            <ActionContainer
                label="Edit me"
                withModal
                fields={[
                    {
                        name: 'name',
                        label: 'Name',
                        type: 'text',
                    },
                ]}
            />
        );
    },
};
