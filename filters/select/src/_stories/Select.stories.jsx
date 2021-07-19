/* eslint-disable */
import React, { useState } from 'react';
import { ApiProvider } from '../../../../packages/data';
import FieldsProvider from '../../../../packages/fields';
import SelectFilter from '../SelectFilter';

export default {
    component: SelectFilter,
    title: 'Filters/Select',
    parameters: {
        intl: true,
    },
};

const FieldContainer = (props) => {
    const [value, setValue] = useState(null);
    return (
        <ApiProvider baseUrl="/api">
            <FieldsProvider>
                <SelectFilter {...props} name="Select" value={value} onChange={setValue} />
            </FieldsProvider>
        </ApiProvider>
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

// TODO: figure out how to mock this
export const Fetching = () => (
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
        // requestUrl="/api/pages"
    />
);
