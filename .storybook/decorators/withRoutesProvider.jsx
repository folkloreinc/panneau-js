import React from 'react';

import { RoutesProvider } from '../../packages/core/src/contexts';

const withRoutesProvider = (Story) => (
    <RoutesProvider routes={{}}>
        <Story />
    </RoutesProvider>
);

export default withRoutesProvider;
