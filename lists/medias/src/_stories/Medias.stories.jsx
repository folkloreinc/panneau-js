import React from 'react';

import { RoutesProvider } from '@panneau/core/contexts';

import pageResource from '../../../../.storybook/data/page-resource';
import { ResourceProvider } from '../../../../packages/core/contexts';
import Medias from '../Medias';

export default {
    component: Medias,
    title: 'Lists/Medias',
    parameters: {
        intl: true,
    },
};

const Container = () => (
    <RoutesProvider
        routes={{
            'resources.show': '/{resource}/{id}',
            'resources.edit': '/{resource}/{id}/edit',
            'resources.delete': '/{resource}/{id}/delete',
        }}
    >
        <ResourceProvider resource={pageResource}>
            <Medias
                resource={pageResource}
                items={[
                    { id: '1', type: 'audio', name: 'Audio Paul' },
                    { id: '2', type: 'video', name: 'Video John' },
                    { id: '3', type: 'document', name: 'Document George' },
                    { id: '4', type: 'image', name: 'Image Ringo' },
                ]}
            />
        </ResourceProvider>
    </RoutesProvider>
);

export const Normal = () => <Container />;
