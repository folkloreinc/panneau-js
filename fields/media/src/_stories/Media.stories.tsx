import { useState } from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';

import definition from '../../../../.storybook/data/panneau-definition';
import withApi from '../../../../.storybook/decorators/withApiProvider';
import ActionsProvider from '../../../../packages/actions';
import { PanneauProvider } from '../../../../packages/core/src/contexts';
import DisplaysProvider from '../../../../packages/displays';
import FieldsProvider from '../../../../packages/fields';
import FiltersProvider from '../../../../packages/filters';
import FormsProvider from '../../../../packages/forms';
import ListsProvider from '../../../../packages/lists';
import { UppyProvider } from '../../../../packages/uppy/src/UppyContext';
import MediaField from '../MediaField';

export default {
    title: 'Fields/Media',
    component: MediaField,
    decorators: [withApi],
    parameters: {
        intl: true,
    },
};

// eslint-disable-next-line react/prop-types
function Container({ value: initialValue = null, ...props }) {
    const [value, setValue] = useState(initialValue);

    return (
        <PanneauProvider definition={definition}>
            <ListsProvider>
                <FiltersProvider>
                    <FieldsProvider>
                        <FormsProvider>
                            <ActionsProvider>
                                <DisplaysProvider>
                                    <ModalProvider>
                                        <div>
                                            <MediaField
                                                {...props}
                                                value={value}
                                                onChange={setValue}
                                            />
                                        </div>
                                        <Modals />
                                    </ModalProvider>
                                </DisplaysProvider>
                            </ActionsProvider>
                        </FormsProvider>
                    </FieldsProvider>
                </FiltersProvider>
            </ListsProvider>
        </PanneauProvider>
    );
}

export const Normal = {
    render: () => <Container />,
};

export const Disabled = {
    render: () => <Container disabled value={{ url: 'lol' }} />,
};

export const WithButton = {
    render: () => <Container withButton />,
};

export const WithResourceList = {
    render: () => <Container withButton withResourceList />,
};

export const Audio = {
    render: () => <Container types={['audio']} />,
};

export const Image = {
    render: () => <Container types={['image']} />,
};

export const Images = {
    render: () => <Container types={['image']} allowMultipleUploads />,
};

export const Video = {
    render: () => <Container types={['video']} />,
};

export const PDF = {
    render: () => <Container fileTypes={['.pdf']} />,
};

export const Fonts = {
    render: () => <Container fileTypes={['.ttf', '.otf']} />,
};

export const WithValue = {
    render: () => <Container value={[{ data: { file: '1200x300.png' } }]} />,
};

export const WithValuesAndClear = {
    render: () => (
        <Container
            value={[
                { data: { file: '1200x300.png' }, preview: 'https://picsum.photos/200/300' },
                { data: { file: '1200x301.png' }, size: 2000078, type: 'image' },
            ]}
            allowMultipleUploads
            withClearButton
        />
    ),
};

export const WithoutSize = {
    render: () => <Container types={['video']} value={null} width={null} height={null} />,
};

export const MultiplePdfs = {
    render: () => (
        <>
            <Container fileTypes={['.pdf']} />
            <UppyProvider id="test2">
                <Container fileTypes={['.pdf']} />
            </UppyProvider>
        </>
    ),
};

export const WithModal = {
    render: () => <Container withButton withFind />,
};

export const WithModalAndTypes = {
    render: () => <Container withButton withFind types={['video']} />,
};

export const WithModalMultiple = {
    render: () => <Container withButton withFind types={['video']} allowMultipleUploads />,
};

export const WithButtonDisabled = {
    render: () => <Container withButton disabled />,
};
