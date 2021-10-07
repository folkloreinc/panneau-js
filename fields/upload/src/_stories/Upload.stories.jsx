/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';
import withUppy from '../../../../.storybook/decorators/withUppy';
import UploadField from '../UploadField';

export default {
    title: 'Fields/Upload',
    component: UploadField,
    decorators: [withUppy],
    parameters: {
        intl: true,
    },
};

// eslint-disable-next-line react/prop-types
const Container = ({ value: initialValue = null, ...props }) => {
    const [value, setValue] = useState(initialValue);
    return <UploadField {...props} value={value} onChange={setValue} />;
};

export const Normal = () => <Container />;
export const WithButton = () => <Container withButton />;
export const Audio = () => <Container types={['audio']} />;
export const Image = () => <Container types={['image']} />;
export const Video = () => <Container types={['video']} />;
export const PDF = () => <Container fileTypes={['.pdf']} />;

export const WithValue = () => <Container value={[{ data: { file: '1200x300.png' } }]} />;
export const WithValues = () => (
    <Container
        value={[
            { data: { file: '1200x300.png' }, preview: 'http://www.fillmurray.com/500/500' },
            { data: { file: '1200x301.png' } },
        ]}
        allowMultipleUploads
    />
);

export const WithModal = () => <Container withButton />;
