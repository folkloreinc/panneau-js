import { useState } from 'react';

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
function Container({ value: initialValue, ...props }) {
    const [value, setValue] = useState(initialValue);
    return <SelectField {...props} value={value} onChange={setValue} />;
}

export const Normal = {
    render: () => <Container options={options} />,
};

export const Disabled = {
    render: () => <Container options={options} disabled />,
};

export const WithoutReset = {
    render: () => <Container options={options} withoutReset placeholder="Without reset..." />,
};

export const MultiSelect = {
    render: () => <Container options={options} multiple placeholder="Multi select..." />,
};

export const MultiDisabled = {
    render: () => (
        <Container options={options} multiple placeholder="Multi select disabled..." disabled />
    ),
};

export const WithRequestAndValueMultiple = {
    render: () => (
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
    ),
};

export const WithRequest = {
    render: () => (
        <Container
            requestUrl="/api/events"
            optionLabelPath="title"
            optionValuePath="id"
            multiple
            placeholder="With Request"
            paginated={false}
        />
    ),
};

export const WithRequestPaginated = {
    render: () => (
        <Container
            requestUrl="/api/persons"
            optionLabelPath="name"
            optionValuePath="id"
            multiple
            placeholder="With Request"
            paginated
            requestQuery={{ count: 2 }}
        />
    ),
};
