/* eslint-disable */
import React, { useState } from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import FieldsProvider from '../../../../packages/fields';
import ModalsProvider from '../../../../packages/modals/src/ModalsProvider';
import EditAction from '../EditAction';

export default {
    component: EditAction,
    title: 'Actions/EditAction',
    parameters: {
        intl: true,
    },
};

const FieldContainer = ({ value: initialValue, ...props }) => {
    const [value, setValue] = useState(initialValue);
    return (
        <FieldsProvider>
            <ModalsProvider>
                <ModalProvider>
                    <Modals />
                    <EditAction
                        {...props}
                        name="button"
                        value={value}
                        onChange={setValue}
                        fields={[
                            {
                                type: 'select',
                                name: 'select-test',
                                label: 'A Select',
                                placeholder: 'Select me',
                            },
                        ]}
                    />
                </ModalProvider>
            </ModalsProvider>
        </FieldsProvider>
    );
};

export const Normal = () => <FieldContainer label="Edit mee" withConfirmation />;
