/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import DisplaysProvider from '../../../../packages/displays';
import DisplayField from '../DisplayField';

import Media1 from '../../../../.storybook/api/items/medias/1.json';

export default {
    title: 'Fields/Display',
    component: DisplayField,
};

// eslint-disable-next-line react/prop-types
const Container = ({ value: initialValue = null, ...props }) => {
    const [value, setValue] = useState(initialValue);
    return (
        <DisplaysProvider>
            <DisplayField {...props} value={value} onChange={setValue} />
        </DisplaysProvider>
    );
};

export const Normal = () => <Container component="text" value="Hello" />;

export const Image = () => <Container component="image" value={Media1} />;
