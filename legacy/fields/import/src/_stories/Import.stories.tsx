import type { ComponentProps } from 'react';
import { useState } from 'react';

import ImportField from '../ImportField';
import type { ImportResult } from '../ImportField';

export default {
    title: 'Fields/Import',
    component: ImportField,
    parameters: {
        intl: true,
    },
};

const template = {
    columns: [
        {
            name: 'First Name',
            key: 'first_name',
            required: true,
            description: 'The first name of the user',
            suggested_mappings: ['First', 'Name'],
        },
        {
            name: 'Age',
            data_type: 'number',
        },
    ],
};

function Container(props: ComponentProps<typeof ImportField>) {
    const [value, setValue] = useState<ImportResult | null>(null);
    return (
        <>
            <ImportField template={template} {...props} onChange={setValue} />
            {value !== null ? <pre className="mt-4">{JSON.stringify(value, null, 4)}</pre> : null}
        </>
    );
}

export const Normal = {
    render: () => <Container />,
};

export const Disabled = {
    render: () => <Container disabled />,
};

export const isModal = {
    render: () => <Container isModal />,
};

export const isModalDisabled = {
    render: () => <Container isModal disabled />,
};
