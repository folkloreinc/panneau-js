import React, { useState } from 'react';

import Delete from '../Delete';

import FieldsProvider from '../../../../packages/fields';

export default {
    component: Delete,
    title: 'Forms/Delete',
    parameters: {
        intl: true,
    },
};

const Container = () => {
    const [value, setValue] = useState({ id: 1 });
    return (
        <FieldsProvider>
            <Delete value={value} onChange={setValue} onSubmit={() => {}} />
        </FieldsProvider>
    );
};

export const DeleteForm = () => <Container />;
