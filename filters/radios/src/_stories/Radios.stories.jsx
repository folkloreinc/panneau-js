/* eslint-disable */
import React, { useState } from 'react';
import FieldsProvider from '../../../../packages/fields';
import RadiosFilter from '../RadiosFilter';

export default {
    component: RadiosFilter,
    title: 'Filters/Radios',
    parameters: {
        intl: true,
    },
};

const FieldContainer = ({ options }) => {
    const [value, setValue] = useState(null);
    return (
        <FieldsProvider>
            <RadiosFilter name="Radios" value={value} options={options} onChange={setValue} />
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
