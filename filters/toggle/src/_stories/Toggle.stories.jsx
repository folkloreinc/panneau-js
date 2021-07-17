/* eslint-disable */
import React, { useState } from 'react';
import FieldsProvider from '../../../../packages/fields';
import ToggleFilter from '../ToggleFilter';

export default {
    component: ToggleFilter,
    title: 'Filters/Toggle',
    parameters: {
        intl: true,
    },
};

const FieldContainer = () => {
    const [value, setValue] = useState(null);
    return (
        <FieldsProvider>
            <ToggleFilter name="toggle" value={value} onChange={setValue} />
        </FieldsProvider>
    );
};

export const Normal = () => <FieldContainer />;
