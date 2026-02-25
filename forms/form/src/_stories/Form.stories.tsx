import { useCallback, useState } from 'react';

import fields from '../../../../.storybook/data/fields';
import formFields from '../../../../.storybook/data/form-fields';
import withFormsFields from '../../../../.storybook/decorators/withFormsFields';
import Form from '../Form';

export default {
    component: Form,
    title: 'Forms/Form',
    parameters: {
        intl: true,
    },
    decorators: [withFormsFields],
};

function Container(props) {
    const [value, setValue] = useState({});
    const onSubmit = useCallback(
        (e) => {
            e.preventDefault();
            console.log(e, value);
        },
        [value],
    );
    return <Form value={value} onChange={setValue} onSubmit={onSubmit} {...props} />;
}

export const Normal = {
    render: () => <Container fields={fields} />,
};

export const WithFields = {
    render: () => <Container fields={formFields} />,
};

export const WithFieldsAndAction = {
    render: () => <Container fields={formFields} action="/login" />,
};
