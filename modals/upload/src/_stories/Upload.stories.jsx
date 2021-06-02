import React from 'react';
import withUppy from '../../../../.storybook/decorators/withUppy';

import Upload from '../Upload';

export default {
    component: Upload,
    title: 'Modals/Upload',
    decorators: [withUppy],
    parameters: {
        intl: true,
    },
};

export const Normal = () => <Upload opened />;
