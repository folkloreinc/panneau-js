import { useState } from 'react';

import fields from '../../../../.storybook/data/fields';
import FieldsProvider from '../../../../packages/fields';
import Fields from '../Fields';

export default {
    component: Fields,
    title: 'Fields/Fields',
    parameters: {
        intl: true,
    },
};

// eslint-disable-next-line react/prop-types
function Container({ value: initialValue = {}, ...props }) {
    const [value, setValue] = useState(initialValue);
    return (
        <FieldsProvider>
            <Fields fields={fields} value={value} onChange={setValue} {...props} />
        </FieldsProvider>
    );
}

export const Normal = {
    render: () => <Container />,
};

export const WithFlat = {
    render: () => <Container />,
};

export const Horizontal = {
    render: () => <Container horizontal />,
};
