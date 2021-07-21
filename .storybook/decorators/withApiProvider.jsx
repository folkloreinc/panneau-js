import React from 'react';
import { ApiProvider } from '../../packages/data/src/contexts/ApiContext';

const withApiProvider = (Story) => {
    return (
        <ApiProvider baseUrl="/api">
            <Story />
        </ApiProvider>
    );
};

export default withApiProvider;
