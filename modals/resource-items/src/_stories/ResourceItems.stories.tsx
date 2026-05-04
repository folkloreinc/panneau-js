import { useState } from 'react';

import { ModalProvider } from '@panneau/core/contexts';
import { Modals } from '@panneau/element-modal';
import ListsProvider from '@panneau/lists';

import pageResource from '../../../../.storybook/data/page-resource';
import withApi from '../../../../.storybook/decorators/withApiProvider';
import { ResourceProvider } from '../../../../packages/core/src/contexts';
import ResourceItems from '../ResourceItems';

export default {
    component: ResourceItems,
    title: 'Modals/ResourceItems',
    decorators: [withApi],
    parameters: {
        intl: true,
    },
};

function Container({ children }) {
    return (
        <ListsProvider>
            <ModalProvider>
                <Modals />
                <ResourceProvider resource={pageResource}>{children}</ResourceProvider>
            </ModalProvider>
        </ListsProvider>
    );
}

export const Normal = {
    render: function () {
        const [opened, setOpened] = useState(true);
        return (
            <Container>
                <button type="button" className="btn btn-primary" onClick={() => setOpened(true)}>
                    Open ResourceItems modal
                </button>
                {opened ? (
                    <ResourceItems resource={pageResource} onClosed={() => setOpened(false)} />
                ) : null}
            </Container>
        );
    },
};
