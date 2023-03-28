/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import EmbedField from '../EmbedField';

export default {
    title: 'Fields/Embed',
    component: EmbedField,
    parameters: {
        intl: true,
    },
};

// eslint-disable-next-line react/prop-types
const Container = ({ value: initialValue, ...props }) => {
    const [value, setValue] = useState(initialValue);
    return (
        <EmbedField {...props} value={value} onChange={setValue} onClose={() => setValue(null)} />
    );
};

export const Normal = () => (
    <Container value="https://www.youtube.com/watch?v=Xw5AiRVqfqk&t=1058s" />
);

export const Disabled = () => (
    <Container value="https://www.youtube.com/watch?v=Xw5AiRVqfqk&t=1058s" disabled />
);

export const WithValue = () => (
    <Container value={{ url: 'https://www.youtube.com/watch?v=Xw5AiRVqfqk&t=1058s' }} />
);

export const WithMeta = () => (
    <Container
        value={{
            url: 'https://www.youtube.com/watch?v=Xw5AiRVqfqk&t=1058s',
            metadata: {
                title: 'Un vidéo cool',
                providerName: 'YouTube',
                authorName: 'Paul',
                thumbnailUrl: 'https://i.vimeocdn.com/video/1163787851_640',
                description: 'Une description',
                duration: 187,
                width: 1920,
                height: 1080,
            },
        }}
    />
);
