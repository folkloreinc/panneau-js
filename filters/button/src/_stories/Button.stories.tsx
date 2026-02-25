/* eslint-disable */
import { useState } from 'react';

import FieldsProvider from '../../../../packages/fields';
import ButtonFilter from '../ButtonFilter';

export default {
    component: ButtonFilter,
    title: 'Filters/Button',
    parameters: {
        intl: true,
    },
};

function FieldContainer(props) {
    const [value, setValue] = useState(null);
    return (
        <FieldsProvider>
            <ButtonFilter {...props} name="button" value={value} onChange={setValue} />
        </FieldsProvider>
    );
}

export const Normal = {
    render: () => <FieldContainer label="Hello" />,
};

export const Link = {
    render: () => <FieldContainer label="Hello" href="/?path=/story/filters-radios--normal" />,
};

export const External = {
    render: () => <FieldContainer label="Hello" href="https://www.google.com" external />,
};

export const OnClick = {
    render: () => <FieldContainer label="Hello" onClick={() => console.log('Hello')} />,
};

export const Disabled = {
    render: () => <FieldContainer label="Hello" disabled />,
};
