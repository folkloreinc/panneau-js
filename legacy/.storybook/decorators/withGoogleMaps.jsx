import React from 'react';

import { GoogleMapsClientProvider } from '../../packages/core/src/contexts';

function withGoogleMaps(Story) {
    return (
        <GoogleMapsClientProvider libraries={['places']}>
            <Story />
        </GoogleMapsClientProvider>
    );
}

export default withGoogleMaps;
