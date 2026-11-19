import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { Media } from '@panneau/core';
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
import { type MediasApi, MediasApiProvider } from '../MediasApiContext';
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

function Container({ api: customApi = null, ...props }: MediasBrowserContainerProps) {
    const api = useApi();
    return (
        <IntlProvider>
            <ModalProvider>
                <ModalsProvider>
                    <FieldsProvider>
                        <DisplaysProvider>
                            <FiltersProvider>
                                <ActionsProvider>
                                    <MediasApiProvider api={customApi || api.medias}>
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

// A medias API in memory, with a trash: deleting a media moves it to the trash, restoring it moves
// it back
const MEMORY_MEDIAS: Media[] = [
    { id: '1', type: 'image', name: 'first-image.jpg', created_at: '2024-02-03 00:00:01' },
    { id: '2', type: 'image', name: 'second-image.jpg', created_at: '2024-02-02 00:00:01' },
    { id: '3', type: 'video', name: 'third-video.mp4', created_at: '2024-02-01 00:00:01' },
];

function createMemoryMediasApi(): MediasApi {
    let items = MEMORY_MEDIAS;
    let trashedItems: Media[] = [];
    const getPage = (pageItems: Media[]) =>
        Promise.resolve({
            data: pageItems,
            meta: { current_page: 1, last_page: 1, total: pageItems.length },
        });
    const move = (id: string, from: Media[], to: Media[]): [Media[], Media[]] => {
        const media = from.find((it) => it.id === id) || null;
        return media !== null ? [from.filter((it) => it !== media), [media, ...to]] : [from, to];
    };
    return {
        get: () => getPage(items),
        getTrashed: () => getPage(trashedItems),
        find: (id) => Promise.resolve(items.find((it) => it.id === id) || null),
        create: (data) => Promise.resolve(data as Media),
        update: (id, data) =>
            Promise.resolve({ ...items.find((it) => it.id === id), ...data } as Media),
        destroy: (id) => {
            [items, trashedItems] = move(id, items, trashedItems);
            return Promise.resolve({ success: true });
        },
        restore: (id) => {
            [trashedItems, items] = move(id, trashedItems, items);
            return Promise.resolve({ success: true });
        },
    } as MediasApi;
}

function MemoryContainer(props: MediasBrowserContainerProps) {
    const [api] = useState(createMemoryMediasApi);
    return <Container {...props} api={api} />;
}

// The action buttons of the table only have an icon
function getRowButton(canvas: ReturnType<typeof within>, name: string, icon: string) {
    const row = canvas.getByText(name).closest('tr');
    return row?.querySelector(`.bi-${icon}`)?.closest('button') || null;
}

// The filter that shows the trash only has an icon too
function getTrashButton(canvasElement: HTMLElement) {
    return (
        [...canvasElement.querySelectorAll('.bi-trash, .bi-trash-fill')]
            .map((icon) => icon.closest('button'))
            .find((button) => button !== null && button.closest('table') === null) || null
    );
}

// A modal closed before it has faded in never ends its transition, so wait for it
async function clickModalButton(canvas: ReturnType<typeof within>, name: string) {
    const button = await canvas.findByRole('button', { name });
    await waitFor(() => expect(getComputedStyle(button.closest('.modal')).opacity).toBe('1'));
    await userEvent.click(button);
}

export const DeleteAndRestore = {
    render: () => <MemoryContainer layout="table" withTrash withoutUpload />,
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        await canvas.findByText('first-image.jpg');

        await step('Delete a media', async () => {
            await userEvent.click(getRowButton(canvas, 'first-image.jpg', 'trash'));
            await clickModalButton(canvas, 'Yes');
            await waitFor(() => expect(canvas.queryByText('first-image.jpg')).toBeNull());
        });

        await step('Cancel the deletion of a media', async () => {
            await userEvent.click(getRowButton(canvas, 'second-image.jpg', 'trash'));
            await clickModalButton(canvas, 'No');
            await waitFor(() => expect(canvas.queryByRole('button', { name: 'No' })).toBeNull());
            await expect(canvas.getByText('second-image.jpg')).toBeInTheDocument();
        });

        await step('Restore the deleted media', async () => {
            await userEvent.click(getTrashButton(canvasElement));
            await canvas.findByText('first-image.jpg');
            await userEvent.click(getRowButton(canvas, 'first-image.jpg', 'recycle'));
            await clickModalButton(canvas, 'Confirm');
            await waitFor(() => expect(canvas.queryByText('first-image.jpg')).toBeNull());

            await userEvent.click(getTrashButton(canvasElement));
            await canvas.findByText('first-image.jpg');
        });
    },
};
