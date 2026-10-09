import { useMemoryRouter } from '@folklore/routes';
import { Router } from 'wouter';

import type { ComponentsMap, PanneauDefinition, User } from '@panneau/core';

import defaultDefinition from '../../../../../.storybook/data/definition';
import PanneauContainer from '../../components/Container';
import storyComponents from './index';

export const storyUser: User = {
    id: '1',
    name: 'Camille Tremblay',
    email: 'camille.tremblay@example.com',
};

export interface AppStoryProps {
    /** The url where the app starts (ex: /pages/1/edit) */
    path?: string;
    definition?: PanneauDefinition;
    user?: User | null;
    components?: ComponentsMap | null;
}

/**
 * Renders the whole Panneau app in a memory router starting at `path`,
 * with the storybook mock API (/api) and the example custom pages.
 */
function AppStory({
    path = '/',
    definition = defaultDefinition,
    user = storyUser,
    components = storyComponents,
}: AppStoryProps) {
    const { hook, searchHook } = useMemoryRouter({ path });
    return (
        <Router hook={hook} searchHook={searchHook}>
            <PanneauContainer
                definition={definition}
                user={user}
                components={components}
                baseUrl="/api"
                uppy={{
                    transport: 'xhr',
                    xhr: {
                        endpoint: '/api/upload',
                    },
                }}
            />
        </Router>
    );
}

export default AppStory;
