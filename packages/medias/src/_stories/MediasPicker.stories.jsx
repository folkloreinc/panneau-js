/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useState } from 'react';

import withApi from '../../../../.storybook/decorators/withApiProvider';
import ActionsProvider from '../../../actions';
import { useApi } from '../../../data/src/contexts/ApiContext';
import DisplaysProvider from '../../../displays';
import FieldsProvider from '../../../fields';
import FiltersProvider from '../../../filters';
import IntlProvider from '../../../intl/src/IntlProvider';
import { UppyProvider } from '../../../uppy/src/UppyContext';
import { MediasApiProvider } from '../MediasApiContext';
import { MediasFormProvider } from '../MediasFormContext';
import MediasPicker from '../MediasPicker';

import Media1 from '../../../../.storybook/api/items/medias/1.json';
import Media2 from '../../../../.storybook/api/items/medias/2.json';
import Media3 from '../../../../.storybook/api/items/medias/3.json';

export default {
    title: 'Medias/MediasPicker',
    component: MediasPicker,
    decorators: [withApi],
    parameters: {
        intl: true,
    },
};

const items = { data: [Media1, Media2, Media3], pagination: { page: 1 } };

// eslint-disable-next-line react/prop-types
const Container = ({ value: initialValue = null, ...props } = {}) => {
    const api = useApi();
    const [value, setValue] = useState(initialValue);
    const onChange = useCallback(
        (newValue) => {
            setValue(newValue);
        },
        [setValue],
    );
    return (
        <IntlProvider>
            <FieldsProvider>
                <DisplaysProvider>
                    <FiltersProvider>
                        <ActionsProvider>
                            <MediasApiProvider api={api.medias}>
                                <MediasFormProvider>
                                    <MediasPicker {...props} value={value} onChange={onChange} />
                                </MediasFormProvider>
                            </MediasApiProvider>
                        </ActionsProvider>
                    </FiltersProvider>
                </DisplaysProvider>
            </FieldsProvider>
        </IntlProvider>
    );
};

export const Default = () => (
    <UppyProvider>
        <Container layout="grid" picker />
    </UppyProvider>
);

export const Items = () => (
    <UppyProvider>
        <Container layout="grid" picker items={items} />
    </UppyProvider>
);

export const Multiple = () => (
    <UppyProvider>
        <Container layout="table" picker multiple />
    </UppyProvider>
);

export const Dark = () => (
    <UppyProvider>
        <div data-bs-theme="dark" style={{ padding: 20, backgroundColor: '#000' }}>
            <Container layout="table" theme="dark" picker />
        </div>
    </UppyProvider>
);

export const WithUploadMultiple = () => (
    <UppyProvider>
        <Container layout="table" picker multiple uploadButton={{ id: 1, icon: 'circle' }} />
    </UppyProvider>
);

export const WithUploadTypes = () => (
    <UppyProvider>
        <Container
            layout="table"
            picker
            multiple
            uploadButton={{ id: 1, icon: 'circle' }}
            types={['image', 'video']}
        />
    </UppyProvider>
);

export const WithStickyValue = () => (
    <UppyProvider>
        <Container
            layout="table"
            picker
            uploadButton={{ id: 1, icon: 'circle' }}
            types={['image', 'video', 'audio']}
            value={Media2}
            withStickyValues
        />
    </UppyProvider>
);

export const WithValueMultiple = () => (
    <UppyProvider>
        <Container
            layout="table"
            picker
            multiple
            uploadButton={{ id: 1, icon: 'circle' }}
            types={['image', 'video', 'audio']}
            value={[Media2, Media3]}
        />
    </UppyProvider>
);

const fields = [];
const columns = [];
const filters = [];

export const Custom = () => (
    <UppyProvider>
        <Container
            layout="table"
            picker
            multiple
            fields={fields}
            columns={columns}
            filters={filters}
        />
    </UppyProvider>
);
