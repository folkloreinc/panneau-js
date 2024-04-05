/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import panneauDefinition from '../../../../.storybook/data/panneau-definition';
import withApi from '../../../../.storybook/decorators/withApiProvider';
import { PanneauProvider } from '../../../core/src/contexts';
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
                    <PanneauProvider definition={panneauDefinition}>
                        <MediasResourceBrowser {...props} />
                    </PanneauProvider>
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
