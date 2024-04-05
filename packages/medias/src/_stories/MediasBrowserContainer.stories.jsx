/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import { useApi } from '@panneau/data';

import withApi from '../../../../.storybook/decorators/withApiProvider';
import IntlProvider from '../../../intl/src/IntlProvider';
import { UppyProvider } from '../../../uppy/src/UppyContext';
import MediasBrowserContainer from '../MediasBrowserContainer';

export default {
    title: 'Medias/MediasBrowserContainer',
    component: MediasBrowserContainer,
    decorators: [withApi],
    parameters: {
        intl: true,
    },
};

const Container = (props) => {
    const api = useApi();
    const mediasApi = useMemo(
        () => ({
            get: (...args) => api.medias.get(args),
            find: (...args) => api.medias.find(args),
            create: (...args) => api.medias.create(args),
            update: (...args) => api.medias.update(args),
            delete: (...args) => api.medias.delete(args),
        }),
        [api],
    );

    console.log('api', api);
    return (
        <IntlProvider>
            <MediasBrowserContainer api={mediasApi} {...props} />
        </IntlProvider>
    );
};

export const Default = () => (
    <UppyProvider>
        <Container />
    </UppyProvider>
);
