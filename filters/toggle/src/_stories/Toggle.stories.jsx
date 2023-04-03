/* eslint-disable react/jsx-props-no-spreading */
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

const FieldContainer = (props) => {
    const [value, setValue] = useState(null);
    return (
        <FieldsProvider>
            <ToggleFilter name="toggle" value={value} onChange={setValue} {...props} />
        </FieldsProvider>
    );
};

export const Normal = () => <FieldContainer />;

export const WithLabel = () => <FieldContainer label="Hello" />;
