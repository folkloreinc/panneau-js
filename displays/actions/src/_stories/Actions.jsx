import React from 'react';

import Actions from '../Actions';

export default {
    component: Actions,
    title: 'Displays/Actions',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <Actions
        value={{
            id: 3,
            name: 'ABC',
            url: test,
        }}
    />
);
