import React, { useState } from 'react';
import FieldsProvider from '../../../../packages/fields';
import SearchFilter from '../SearchFilter';

export default {
    component: SearchFilter,
    title: 'Filters/Search',
    parameters: {
        intl: true,
    },
};

const FieldContainer = () => {
    const [value, setValue] = useState(null);
    return (
        <FieldsProvider>
            <SearchFilter name="search" value={value} onChange={setValue} />
        </FieldsProvider>
    );
};

export const Normal = () => <FieldContainer />;
