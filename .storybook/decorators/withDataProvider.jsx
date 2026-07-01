import React from 'react';

import DataProvider from '../../packages/data/src/DataProvider';

function withDataProvider(Story) {
    console.log(Story);
    return (
        <DataProvider baseUrl="/api">
            <Story />
        </DataProvider>
    );
}

export default withDataProvider;
