/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useState } from 'react';

import withApi from '../../../../.storybook/decorators/withApiProvider';
import { useApi } from '../../../data/src/contexts/ApiContext';
import DisplaysProvider from '../../../displays';
import FieldsProvider from '../../../fields';
import IntlProvider from '../../../intl/src/IntlProvider';
import { UppyProvider } from '../../../uppy/src/UppyContext';
import MediaForm from '../MediaForm';
import { MediasApiProvider } from '../MediasApiContext';

import Media1 from '../../../../.storybook/api/items/medias/1.json';
import Media3 from '../../../../.storybook/api/items/medias/3.json';
import Media11 from '../../../../.storybook/api/items/medias/11.json';

export default {
    title: 'Medias/MediaForm',
    component: MediaForm,
    decorators: [withApi],
    parameters: {
        intl: true,
    },
};

// eslint-disable-next-line react/prop-types
const Container = ({ value: initialValue, ...props } = {}) => {
    const api = useApi();
    const [value, setValue] = useState(initialValue);
    const onChange = useCallback(
        (newValue) => {
            setValue(newValue);
        },
        [setValue],
    );
    return (
        <FieldsProvider>
            <DisplaysProvider>
                <IntlProvider>
                    <MediasApiProvider api={api.medias}>
                        <MediaForm
                            {...props}
                            value={value}
                            onChange={onChange}
                            onConfirm={() => console.log('confirm')}
                            onDelete={() => console.log('delete')}
                            onClose={() => console.log('close')}
                        />
                    </MediasApiProvider>
                </IntlProvider>
            </DisplaysProvider>
        </FieldsProvider>
    );
};

export const Image = () => (
    <UppyProvider>
        <Container value={Media1} />
    </UppyProvider>
);

export const Video = () => (
    <UppyProvider>
        <Container value={Media3} />
    </UppyProvider>
);

export const Audio = () => (
    <UppyProvider>
        <Container value={Media11} />
    </UppyProvider>
);
