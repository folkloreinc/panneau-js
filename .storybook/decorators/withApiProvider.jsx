import React from 'react';

import { ApiProvider } from '../../packages/data/src/contexts/ApiContext';
import { QueryProvider } from '../../packages/data/src/contexts/QueryContext';

function withApiProvider(Story) {
    return (
        <ApiProvider baseUrl="/api">
            <QueryProvider>
                <Story />
            </QueryProvider>
        </ApiProvider>
    );
}

export default withApiProvider;
