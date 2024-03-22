import React from 'react';

import Unit from '../Unit';

export default {
    component: Unit,
    title: 'Displays/Unit',
    parameters: {
        intl: true,
    },
};

export const Bytes = () => <Unit format="bytes" value={1092138} />;

export const Duration = () => <Unit format="duration" value="1092138" />;

export const Dimensions = () => <Unit format="dimensions" value={{ width: 30, height: 40 }} />;

export const Dimensions3D = () => (
    <Unit format="dimensions" value={{ width: 30, height: 40, depth: 50 }} />
);
