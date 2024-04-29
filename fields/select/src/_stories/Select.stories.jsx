/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import withApi from '../../../../.storybook/decorators/withApiProvider';
import SelectField from '../SelectField';

export default {
    title: 'Fields/Select',
    component: SelectField,
    decorators: [withApi],
    parameters: {
        intl: true,
    },
};

const options = ['One', 'Two', 'Three'];

// eslint-disable-next-line react/prop-types
const Container = ({ value: initialValue, ...props }) => {
    const [value, setValue] = useState(initialValue);
    return <SelectField {...props} value={value} onChange={setValue} />;
};

export const Normal = () => <Container options={options} />;

export const Disabled = () => <Container options={options} disabled />;

export const WithoutReset = () => (
    <Container options={options} withoutReset placeholder="Without reset..." />
);

export const MultiSelect = () => (
    <Container options={options} multiple placeholder="Multi select..." />
);

export const MultiDisabled = () => (
    <Container options={options} multiple placeholder="Multi select disabled..." disabled />
);

export const WithRequestAndValueMultiple = () => (
    <Container
        value={[{ id: '1', type: 'event', title: '1 évévnement' }]}
        valueIsOption
        requestUrl="/api/events"
        optionLabelPath="title"
        optionValuePath="id"
        multiple
        placeholder="With Request and initial value"
        paginated={false}
    />
);

export const WithRequest = () => (
    <Container
        requestUrl="/api/events"
        optionLabelPath="title"
        optionValuePath="id"
        multiple
        placeholder="With Request"
        paginated={false}
    />
);

export const WithRequestPaginated = () => (
    <Container
        requestUrl="/api/persons"
        optionLabelPath="name"
        optionValuePath="id"
        multiple
        placeholder="With Request"
        paginated
        requestQuery={{ count: 2 }}
    />
);
