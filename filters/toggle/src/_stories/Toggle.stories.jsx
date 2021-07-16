/* eslint-disable */
import React, { useState } from 'react';
import FieldsProvider from '../../../../packages/fields';
import Toggle from '../Toggle';

export default {
    component: Toggle,
    title: 'Filters/Toggle',
    parameters: {
        intl: true,
    },
};

const FieldContainer = () => {
    const [value, setValue] = useState(null);
    return (
        <FieldsProvider>
            <Toggle name="Toggle" value={value} onChange={setValue} />
        </FieldsProvider>
    );
};

export const Normal = () => <FieldContainer />;
