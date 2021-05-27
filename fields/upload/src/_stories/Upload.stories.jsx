/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import UploadField from '../UploadField';
import withUppy from '../../../../.storybook/decorators/withUppy';

export default {
    title: 'Fields/Upload',
    component: UploadField,
    decorators: [withUppy],
    parameters: {
        intl: true,
    },
};

const Container = (props) => {
    const [value, setValue] = useState(null);
    return (
        <UploadField {...props} value={value} onChange={setValue} />
    );
};

export const Normal = () => <Container />;
export const WithButton = () => <Container withButton />;
