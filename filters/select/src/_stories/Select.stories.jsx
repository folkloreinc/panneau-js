/* eslint-disable */
import React, { useState } from 'react';
import withApi from '../../../../.storybook/decorators/withApiProvider';
import FieldsProvider from '../../../../packages/fields';
import SelectFilter from '../SelectFilter';

export default {
    component: SelectFilter,
    title: 'Filters/Select',
    decorators: [withApi],
    parameters: {
        intl: true,
    },
};

const FieldContainer = (props) => {
    const [value, setValue] = useState(null);
    return (
        <FieldsProvider>
            <SelectFilter {...props} name="Select" value={value} onChange={setValue} />
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

// TODO: figure out how to mock this
export const Fetching = () => (
    <FieldContainer
        options={[
            {
                value: 'chose1',
                label: 'Chose 1',
            },
        ]}
        requestUrl="/pages"
        itemLabelPath="title.en"
        itemValuePath="id"
    />
);

export const WithParams = () => (
    <FieldContainer
        requestUrl="/pages"
        itemLabelPath="title.en"
        itemValuePath="id"
        requestParams={['peter']}
    />
);
