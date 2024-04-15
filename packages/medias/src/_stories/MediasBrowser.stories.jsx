/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useState } from 'react';

import withApi from '../../../../.storybook/decorators/withApiProvider';
import withIntl from '../../../../.storybook/decorators/withIntlProvider';
import ActionsProvider from '../../../actions';
import { useApi } from '../../../data/src/contexts/ApiContext';
import DisplaysProvider from '../../../displays';
import FieldsProvider from '../../../fields';
import FiltersProvider from '../../../filters';
import IntlProvider from '../../../intl/src/IntlProvider';
import { UppyProvider } from '../../../uppy/src/UppyContext';
import { MediasApiProvider } from '../MediasApiContext';
import MediasBrowser from '../MediasBrowserContainer';

import Media1 from '../../../../.storybook/api/items/medias/1.json';
import Media2 from '../../../../.storybook/api/items/medias/2.json';
import Media3 from '../../../../.storybook/api/items/medias/3.json';

export default {
    title: 'Medias/MediasBrowser',
    component: MediasBrowser,
    decorators: [withApi, withIntl],
    parameters: {
        intl: true,
    },
};

const items = [Media1, Media2, Media3];

// eslint-disable-next-line react/prop-types
const Container = ({ ...props } = {}) => {
    const api = useApi();
    return (
        <IntlProvider>
            <FieldsProvider>
                <DisplaysProvider>
                    <FiltersProvider>
                        <ActionsProvider>
                            <MediasApiProvider api={api.medias}>
                                <MediasBrowser {...props} />
                            </MediasApiProvider>
                        </ActionsProvider>
                    </FiltersProvider>
                </DisplaysProvider>
            </FieldsProvider>
        </IntlProvider>
    );
};

export const Default = () => <Container />;

export const Table = () => (
    <UppyProvider>
        <Container layout="table" />
    </UppyProvider>
);

export const Grid = () => (
    <UppyProvider>
        <Container layout="grid" />
    </UppyProvider>
);

export const GridOnly = () => (
    <UppyProvider>
        <Container layout="grid" layouts={null} />
    </UppyProvider>
);

export const Dark = () => (
    <UppyProvider>
        <div data-bs-theme="dark" style={{ padding: 20, backgroundColor: '#000' }}>
            <Container items={items} />
        </div>
    </UppyProvider>
);

export const Theme = () => (
    <UppyProvider>
        <div style={{ padding: 20, backgroundColor: '#000' }}>
            <Container items={items} theme="dark" />
        </div>
    </UppyProvider>
);

export const WithButtons = () => (
    <UppyProvider>
        <Container items={items} buttons={[{ id: 'upload', label: 'Custom', theme: 'primary' }]} />
    </UppyProvider>
);

export const WithUploadButton = () => (
    <UppyProvider>
        <Container
            items={items}
            uploadButton={[{ id: 'upload', label: 'Custom', theme: 'danger' }]}
        />
    </UppyProvider>
);

const fields = [];
const columns = [];
const filters = [];
const metadatas = { sections: [], displays: [] };

export const Custom = () => (
    <UppyProvider>
        <Container
            layout="table"
            theme="dark"
            picker
            multiple
            fields={fields}
            columns={columns}
            filters={filters}
            metadatas={metadatas}
        />
    </UppyProvider>
);
