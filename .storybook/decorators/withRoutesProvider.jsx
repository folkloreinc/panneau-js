import React from 'react';

import { RoutesProvider } from '../../packages/core/src/contexts';
import panneauDefinition from '../data/panneau-definition';

const withRoutesProvider = (Story) => (
    <RoutesProvider routes={panneauDefinition.routes || {}}>
        <Story />
    </RoutesProvider>
);

export default withRoutesProvider;
