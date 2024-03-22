/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useState } from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { useApi } from '@panneau/data';
import { Modals } from '@panneau/element-modal';
import { MediasApiProvider } from '@panneau/medias';

import withApiProvider from '../../../../.storybook/decorators/withApiProvider';
import DisplaysProvider from '../../../../packages/displays';
import FieldsProvider from '../../../../packages/fields';
import FiltersProvider from '../../../../packages/filters';
import MediasPicker from '../MediasPicker';

export default {
    component: MediasPicker,
    title: 'Modals/MediasPicker',
    decorators: [withApiProvider],
    parameters: {
        intl: true,
    },
};

const Container = (props) => {
    const api = useApi();
    const [value, setValue] = useState(null);
    const onChange = useCallback(
        (newValue) => {
            setValue(newValue);
        },
        [setValue],
    );
    return (
        <MediasApiProvider api={api.medias}>
            <DisplaysProvider>
                <FieldsProvider>
                    <FiltersProvider>
                        <ModalProvider>
                            <Modals />
                            <MediasPicker {...props} value={value} onChange={onChange} />
                        </ModalProvider>
                    </FiltersProvider>
                </FieldsProvider>
            </DisplaysProvider>
        </MediasApiProvider>
    );
};

export const Normal = () => <Container />;

export const Multiple = () => <Container multiple />;
