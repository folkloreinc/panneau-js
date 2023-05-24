/* eslint-disable */
import React, { useCallback, useState } from 'react';

import filters from '../../../../.storybook/data/filters';
import FiltersProvider from '../../../../packages/filters';
import Filters from '../Filters';

export default {
    component: Filters,
    title: 'Filters/Filters',
    parameters: {
        intl: true,
    },
};

const FieldContainer = (props) => {
    const [value, setValue] = useState();
    const onChange = useCallback((newValue) => {
        setValue(newValue);
    }, []);
    return (
        <FiltersProvider>
            <Filters {...props} filters={filters} value={value} onChange={onChange} />
        </FiltersProvider>
    );
};

export const Normal = () => <FieldContainer label="Hello" />;
