/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react';

import withApi from '../../../../.storybook/decorators/withApiProvider';
import DisplaysProvider from '../../../displays';
import FieldsProvider from '../../../fields';
import FiltersProvider from '../../../filters';
import IntlProvider from '../../../intl/src/IntlProvider';
import { UppyProvider } from '../../../uppy/src/UppyContext';
import MediasResourceBrowser from '../MediasResourceBrowser';

export default {
    title: 'Medias/MediasResourceBrowser',
    component: MediasResourceBrowser,
    decorators: [withApi],
    parameters: {
        intl: true,
    },
};

const Container = (props) => (
    <FieldsProvider>
        <IntlProvider>
            <DisplaysProvider>
                <FiltersProvider>
                    <MediasResourceBrowser {...props} />
                </FiltersProvider>
            </DisplaysProvider>
        </IntlProvider>
    </FieldsProvider>
);

export const Default = () => (
    <UppyProvider>
        <Container />
    </UppyProvider>
);
