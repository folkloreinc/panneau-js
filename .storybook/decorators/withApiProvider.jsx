import React from 'react';

import { ApiProvider } from '../../packages/data/src/contexts/ApiContext';
import { QueryProvider } from '../../packages/data/src/contexts/QueryContext';

const withApiProvider = (Story) => (
    <ApiProvider baseUrl="/api">
        <QueryProvider>
            <Story />
        </QueryProvider>
    </ApiProvider>
);

export default withApiProvider;
