import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import withApi from '../../../../.storybook/decorators/withDataProvider';
import withIntl from '../../../../.storybook/decorators/withIntlProvider';
import withUppy from '../../../../.storybook/decorators/withUppy';
import ActionsProvider from '../../../actions/src';
import { useApi } from '../../../data/src/contexts/ApiContext';
import DisplaysProvider from '../../../displays/src';
import FieldsProvider from '../../../fields/src';
import FiltersProvider from '../../../filters/src';
import IntlProvider from '../../../intl/src/IntlProvider';
import ModalsProvider from '../../../modals/src/ModalsProvider';
// import ModalsProvider from '../../../modals';
import { UppyProvider } from '../../../uppy/src/UppyContext';
import { MediasApiProvider } from '../MediasApiContext';
import MediasBrowser from '../MediasBrowserContainer';
import type { MediasBrowserContainerProps } from '../MediasBrowserContainer';

export default {
    title: 'Medias/MediasBrowser',
    component: MediasBrowser,
    decorators: [withApi, withIntl, withUppy],
    parameters: {
        intl: true,
    },
};

function Container(props: MediasBrowserContainerProps) {
    const api = useApi();
    return (
        <IntlProvider>
            <ModalProvider>
                <ModalsProvider>
                    <FieldsProvider>
                        <DisplaysProvider>
                            <FiltersProvider>
                                <ActionsProvider>
                                    <MediasApiProvider api={api.medias}>
                                        <MediasBrowser {...props} />
                                        <Modals />
                                    </MediasApiProvider>
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
    render: () => <Container />,
};

export const Table = {
    render: () => (
        <UppyProvider>
            <Container layout="table" />
        </UppyProvider>
    ),
};

export const Grid = {
    render: () => (
        <UppyProvider>
            <Container layout="grid" />
        </UppyProvider>
    ),
};

export const GridOnly = {
    render: () => (
        <UppyProvider>
            <Container layout="grid" layouts={null} />
        </UppyProvider>
    ),
};

export const Dark = {
    render: () => (
        <UppyProvider>
            <div data-bs-theme="dark" style={{ padding: 20, backgroundColor: '#000' }}>
                <Container layout="grid" />
            </div>
        </UppyProvider>
    ),
};

export const Theme = {
    render: () => (
        <UppyProvider>
            <div style={{ padding: 20, backgroundColor: '#000' }}>
                <Container theme="dark" layout="grid" />
            </div>
        </UppyProvider>
    ),
};

export const WithTrash = {
    render: () => (
        <UppyProvider>
            <Container withTrash />
        </UppyProvider>
    ),
};

export const WithoutUpload = {
    render: () => (
        <UppyProvider>
            <Container withoutUpload />
        </UppyProvider>
    ),
};

export const Permissions = {
    render: () => (
        <UppyProvider>
            <Container permissions={{ edit: false, delete: false, create: false }} />
        </UppyProvider>
    ),
};

const fields = [];
const columns = [];
const filters = [];

export const Custom = {
    render: () => (
        <UppyProvider>
            <Container
                layout="table"
                theme="dark"
                multipleSelection
                fields={fields}
                columns={columns}
                filters={filters}
            />
        </UppyProvider>
    ),
};
