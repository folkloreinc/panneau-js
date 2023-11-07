/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import FieldsProvider from '../../../fields';
import IntlProvider from '../../../intl/src/IntlProvider';
import { UppyProvider } from '../../../uppy/src/UppyContext';
import MediasResourceBrowser from '../MediasResourceBrowser';

export default {
    title: 'Medias/MediasResourceBrowser',
    component: MediasResourceBrowser,
    parameters: {
        intl: true,
    },
};

const Container = (props) => (
    <FieldsProvider>
        <IntlProvider>
            <MediasResourceBrowser {...props} />
        </IntlProvider>
    </FieldsProvider>
);

export const Default = () => (
    <UppyProvider>
        <Container

        />
    </UppyProvider>
);
