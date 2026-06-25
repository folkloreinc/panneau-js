import { useMemo } from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { useApi } from '@panneau/data';
import { Modals } from '@panneau/element-modal';

import withApi from '../../../../.storybook/decorators/withDataProvider';
import ActionsProvider from '../../../actions';
import DisplaysProvider from '../../../displays';
import FieldsProvider from '../../../fields';
import FiltersProvider from '../../../filters';
import IntlProvider from '../../../intl/src/IntlProvider';
import ModalsProvider from '../../../modals/src/ModalsProvider';
import { UppyProvider } from '../../../uppy/src/UppyContext';
import { MediasApi } from '../MediasApiContext';
import MediasBrowserContainer from '../MediasBrowserContainer';

export default {
    title: 'Medias/MediasBrowserContainer',
    component: MediasBrowserContainer,
    decorators: [withApi],
    parameters: {
        intl: true,
    },
};

function Container(props) {
    const api = useApi();
    const mediasApi: MediasApi = useMemo(
        () => ({
            get: (...args) => api.medias.get(...args),
            find: (...args) => api.medias.find(...args),
            create: (...args) => api.medias.create(...args),
            update: (...args) => api.medias.update(...args),
            destroy: (...args) => api.medias.destroy(...args),
            getTrashed: (...args) => api.medias.get(...args),
        }),
        [api],
    );
    return (
        <IntlProvider>
            <ModalProvider>
                <ModalsProvider>
                    <FieldsProvider>
                        <DisplaysProvider>
                            <FiltersProvider>
                                <ActionsProvider>
                                    <MediasBrowserContainer api={mediasApi} {...props} />
                                    <Modals />
                                </ActionsProvider>
                            </FiltersProvider>
                        </DisplaysProvider>
                    </FieldsProvider>
                </ModalsProvider>
            </ModalProvider>
        </IntlProvider>
    );
}

export const Default = {
    render: () => (
        <UppyProvider>
            <Container />
        </UppyProvider>
    ),
};
