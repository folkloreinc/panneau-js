import React from 'react';

import TextDescription from '../TextDescription';

export default {
    component: TextDescription,
    title: 'Displays/TextDescription',
    parameters: {
        intl: true,
    },
};

export const Normal = () => (
    <TextDescription
        value="Hello! I am text"
        item={{ id: 1, type: 'Image' }}
        descriptionPath="type"
    />
);
