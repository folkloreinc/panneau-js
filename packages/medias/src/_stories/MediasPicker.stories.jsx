/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useState } from 'react';

import withApi from '../../../../.storybook/decorators/withApiProvider';
import { useApi } from '../../../data/src/contexts/ApiContext';
import DisplaysProvider from '../../../displays';
import FieldsProvider from '../../../fields';
import FiltersProvider from '../../../filters';
import IntlProvider from '../../../intl/src/IntlProvider';
import { UppyProvider } from '../../../uppy/src/UppyContext';
import { MediasApiProvider } from '../MediasApiContext';
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

const items = [Media1, Media2, Media3];

// eslint-disable-next-line react/prop-types
const Container = ({ ...props } = {}) => {
    const api = useApi();
    const [value, setValue] = useState(null);
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
                        <MediasApiProvider api={api.medias}>
                            <MediasPicker {...props} value={value} onChange={onChange} />
                        </MediasApiProvider>
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
