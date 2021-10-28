/* eslint-disable */
import React, { useState } from 'react';
import FieldsProvider from '../../../../packages/fields';
import ButtonFilter from '../ButtonFilter';

export default {
    component: ButtonFilter,
    title: 'Filters/Button',
    parameters: {
        intl: true,
    },
};

const FieldContainer = (props) => {
    const [value, setValue] = useState(null);
    return (
        <FieldsProvider>
            <ButtonFilter {...props} name="button" value={value} onChange={setValue} />
        </FieldsProvider>
    );
};

export const Normal = () => <FieldContainer label="Hello" />;

export const Link = () => (
    <FieldContainer label="Hello" href="/?path=/story/filters-radios--normal" />
);

export const External = () => (
    <FieldContainer label="Hello" href="https://www.google.com" external />
);

export const OnClick = () => <FieldContainer label="Hello" onClick={() => console.log('Hello')} />;

export const Disabled = () => <FieldContainer label="Hello" disabled />;
