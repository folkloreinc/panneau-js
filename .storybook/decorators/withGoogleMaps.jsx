import React from 'react';
import { GoogleMapsClientProvider } from '../../packages/core/src/contexts';

const withGoogleMaps = (Story) => (
    <GoogleMapsClientProvider libraries={['places']}>
        <Story />
    </GoogleMapsClientProvider>
);

export default withGoogleMaps;
