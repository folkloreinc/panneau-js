import React from 'react';
import InputGroupField from '../InputGroupField';

export default {
    title: 'Fields/InputGroup',
    component: InputGroupField,
};

export const Normal = () => (
    <InputGroupField prepend="Prepend" append="Append">
        <input className="form-control" />
    </InputGroupField>
);
