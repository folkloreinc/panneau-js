/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import withUppy from '../../../../.storybook/decorators/withUppy';
import { UppyProvider } from '../../../../packages/uppy/src/UppyContext';
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
    return (
        <ModalProvider>
            <div>
                <UploadField {...props} value={value} onChange={setValue} />
            </div>
            <Modals />
        </ModalProvider>
    );
};

export const Normal = () => <Container />;

export const Disabled = () => <Container disabled value={{ url: 'lol' }} />;

export const WithButton = () => <Container withButton />;

export const WithResourceList = () => <Container withButton withResourceList />;

export const Audio = () => <Container types={['audio']} />;

export const Image = () => <Container types={['image']} />;

export const Images = () => <Container types={['image']} allowMultipleUploads />;

export const Video = () => <Container types={['video']} />;

export const PDF = () => <Container fileTypes={['.pdf']} />;

export const Fonts = () => <Container fileTypes={['.ttf', '.otf']} />;

export const WithValue = () => <Container value={[{ data: { file: '1200x300.png' } }]} />;

export const WithValuesAndClear = () => (
    <Container
        value={[
            { data: { file: '1200x300.png' }, preview: 'https://picsum.photos/200/300' },
            { data: { file: '1200x301.png' }, size: 2000078, type: 'image' },
        ]}
        allowMultipleUploads
        withClearButton
    />
);

export const WithoutSize = () => (
    <Container types={['video']} value={null} width={null} height={null} />
);

export const Multiple = () => (
    <>
        <Container fileTypes={['.pdf']} />
        <UppyProvider id="test2">
            <Container fileTypes={['.pdf']} />
        </UppyProvider>
    </>
);

export const WithModal = () => <Container withButton withFind />;

export const WithButtonDisabled = () => <Container withButton disabled />;
