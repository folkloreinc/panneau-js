/* eslint-disable */
import { useCallback, useState } from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import actions from '../../../../.storybook/data/actions';
import withApi from '../../../../.storybook/decorators/withApiProvider';
import withUppy from '../../../../.storybook/decorators/withUppy';
import ActionsProvider from '../../../../packages/actions/src/index';
import ModalsProvider from '../../../../packages/modals/src/ModalsProvider';
import Actions from '../Actions';

export default {
    component: Actions,
    title: 'Actions/Actions',
    decorators: [withUppy, withApi],
    parameters: {
        intl: true,
    },
};

function ActionsContainer({ value: initialValue, ...props }) {
    const [value, setValue] = useState(initialValue);
    const onChange = useCallback((newValue) => {
        setValue(newValue);
    }, []);
    return (
        <ActionsProvider>
            <ModalsProvider>
                <ModalProvider>
                    <Modals />
                    <Actions {...props} actions={actions} value={value} onChange={onChange} />
                </ModalProvider>
            </ModalsProvider>
        </ActionsProvider>
    );
}

export const Normal = {
    render: function () {
        return <ActionsContainer />;
    },
};

export const WithItems = {
    render: function () {
        return <ActionsContainer value={[{ id: '1', name: 'OK' }]} withConfirmation />;
    },
};

export const WithMultipleItems = {
    render: function () {
        return (
            <ActionsContainer
                value={[
                    { id: '1', name: 'OK' },
                    { id: '2', name: 'KO' },
                    { id: 3, name: 'WHAT' },
                ]}
                withConfirmation
            />
        );
    },
};
