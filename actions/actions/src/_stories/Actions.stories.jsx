/* eslint-disable */
import React, { useCallback, useState } from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import actions from '../../../../.storybook/data/actions';
import FiltersProvider from '../../../../packages/actions';
import Actions from '../Actions';

export default {
    component: Actions,
    title: 'Actions/Actions',
    parameters: {
        intl: true,
    },
};

const ActionsContainer = ({ value: initialValue, ...props }) => {
    const [value, setValue] = useState(initialValue);
    const onChange = useCallback((newValue) => {
        setValue(newValue);
    }, []);
    return (
        <FiltersProvider>
            <ModalProvider>
                <Modals />
                <Actions {...props} actions={actions} value={value} onChange={onChange} />
            </ModalProvider>
        </FiltersProvider>
    );
};

export const Normal = () => <ActionsContainer />;

export const WithItems = () => (
    <ActionsContainer value={[{ id: '1', name: 'OK' }]} withConfirmation />
);

export const WithMultipleItems = () => (
    <ActionsContainer
        value={[
            { id: '1', name: 'OK' },
            { id: '2', name: 'KO' },
        ]}
        withConfirmation
    />
);
