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

const ActionsContainer = (props) => {
    const [value, setValue] = useState([{ id: '1', name: 'OK' }]);
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

export const Normal = () => <ActionsContainer label="Hello" />;
