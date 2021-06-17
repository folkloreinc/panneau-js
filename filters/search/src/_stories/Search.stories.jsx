import React, { useState } from 'react';
import FieldsProvider from '../../../../packages/fields';
import Search from '../Search';

export default {
    component: Search,
    title: 'Filters/Search',
    parameters: {
        intl: true,
    },
};

const FieldContainer = () => {
    const [value, setValue] = useState(null);
    return (
        <FieldsProvider>
            <Search name="search" value={value} onChange={setValue} />
        </FieldsProvider>
    );
};

export const Normal = () => <FieldContainer />;
