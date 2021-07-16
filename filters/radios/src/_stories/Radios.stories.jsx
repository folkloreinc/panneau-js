/* eslint-disable */
import React, { useState } from 'react';
import FieldsProvider from '../../../../packages/fields';
import Radios from '../Radios';

export default {
    component: Radios,
    title: 'Filters/Radios',
    parameters: {
        intl: true,
    },
};

const FieldContainer = ({options}) => {
    const [value, setValue] = useState(null);
    return (
        <FieldsProvider>
            <Radios name="Radios" value={value} options={options} onChange={setValue} />
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
