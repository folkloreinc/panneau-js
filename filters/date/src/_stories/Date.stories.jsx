/* eslint-disable */
import React, { useState } from 'react';
import FieldsProvider from '../../../../packages/fields';
import DateFilter from '../DateFilter';

export default {
    component: DateFilter,
    title: 'Filters/Date',
    parameters: {
        intl: true,
    },
};

const FieldContainer = ({ options }) => {
    const [value, setValue] = useState(null);
    return (
        <FieldsProvider>
            <DateFilter name="Date" value={value} options={options} onChange={setValue} />
        </FieldsProvider>
    );
};

export const Normal = () => (
    <FieldContainer
        options={[
            {
                value: 'chose1',
                label: 'Chose 1',
            },
            {
                value: 'chose2',
                label: 'Chose 2',
            },
            {
                value: 'chose3',
                label: 'Chose 3',
            },
        ]}
    />
);
