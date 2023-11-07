/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import FieldsProvider from '../../../fields';
import IntlProvider from '../../../intl/src/IntlProvider';
import { UppyProvider } from '../../../uppy/src/UppyContext';
import MediasBrowser from '../MediasBrowserContainer';

export default {
    title: 'Medias/MediasBrowser',
    component: MediasBrowser,
    parameters: {
        intl: true,
    },
};

const Container = (props) => (
    <FieldsProvider>
        <IntlProvider>
            <MediasBrowser {...props} />
        </IntlProvider>
    </FieldsProvider>
);

export const Default = () => (
    <UppyProvider>
        <Container

        />
    </UppyProvider>
);
