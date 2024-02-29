import React from 'react';

import pageResource from '../../../../.storybook/data/page-resource';
import withApi from '../../../../.storybook/decorators/withApiProvider';
import { PanneauProvider } from '../../../../packages/core/src/contexts';
import DisplaysProvider from '../../../../packages/displays/src';
import ListsProvider from '../../../../packages/lists/src';
import ResourceItems from '../ResourceItems';

export default {
    component: ResourceItems,
    title: 'Lists/ResourceItems',
    decorators: [withApi],
    parameters: {
        intl: true,
    },
};

const Container = () => (
    <PanneauProvider resource={pageResource}>
        <ListsProvider>
            <DisplaysProvider>
                <ResourceItems
                    resource={pageResource}
                    items={[
                        { id: '1', type: 'audio', name: 'Audio Paul' },
                        { id: '2', type: 'video', name: 'Video John' },
                        { id: '3', type: 'document', name: 'Document George' },
                        { id: '4', type: 'image', name: 'Image Ringo' },
                    ]}
                />
            </DisplaysProvider>
        </ListsProvider>
    </PanneauProvider>
);

export const Normal = () => <Container />;
