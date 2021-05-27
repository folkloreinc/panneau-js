/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { UppyProvider } from '../../packages/core/src/contexts';

const props = {
    // transport: 'transloadit',
    // transloadit: {
    //     key: process.env.TRANSLOADIT_KEY || null,
    //     templateId: process.env.TRANSLOADIT_TEMPLATE_ID || null,
    // },
    transport: 'tus',
    tus: {
        endpoint: 'http://localhost:58800/tus',
    },
};

const withUppy = (Story) => (
    <UppyProvider {...props}>
        <Story />
    </UppyProvider>
);

export default withUppy;
