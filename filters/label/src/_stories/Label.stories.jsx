/* eslint-disable */
import React, { useState } from 'react';

import FieldsProvider from '../../../../packages/fields';
import LabelFilter from '../LabelFilter';

export default {
    component: LabelFilter,
    title: 'Filters/Label',
    parameters: {
        intl: true,
    },
};

const FieldContainer = (props) => {
    return (
        <FieldsProvider>
            <LabelFilter {...props} />
        </FieldsProvider>
    );
};

export const Normal = {
    render: () => <FieldContainer label="Hello" />,
};

export const Link = {
    render: () => (

    <FieldContainer label="Hello" sublabel="hella" href="/?path=/story/filters-radios--normal" />

    ),
};

export const External = {
    render: () => (

    <FieldContainer label="Hello external link" href="https://www.google.com" external />

    ),
};

export const OnClick = {
    render: () => <FieldContainer label="Hello" onClick={() => console.log('Hello')} />,
};

export const Disabled = {
    render: () => <FieldContainer label="Hello" disabled />,
};