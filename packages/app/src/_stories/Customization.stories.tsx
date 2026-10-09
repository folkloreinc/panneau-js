import { getCSRFHeaders } from '@folklore/fetch';
import { Link } from 'wouter';

import type { Resource } from '@panneau/core';

import panneauDefinition from '../../../../.storybook/data/panneau-definition';
import { PAGES_NAMESPACE, useUrlGenerator } from '../../../core/src/contexts';
import PanneauContainer from '../components/Container';

export default {
    component: PanneauContainer,
    title: 'App/Customization',
    parameters: {
        intl: {
            locale: panneauDefinition.intl.locale,
        },
        router: false,
    },
};

const props = {
    baseUrl: 'http://localhost:58800/api', // Should be whatever, /api is for storybook
    uppy: {
        transport: 'xhr' as const,
        xhr: {
            endpoint: 'https://ondinnok.test:8080/panneau/upload',
            headers: getCSRFHeaders(),
            timeout: 0,
        },
    },
};

const user = { id: 1, name: 'Folklore', email: 'info@atelierfolklore.ca' };

interface CustomResourcePageProps {
    resource: Resource;
    itemId?: string | null;
}

function CustomResourceIndexPage({ resource }: CustomResourcePageProps) {
    const route = useUrlGenerator();
    return (
        <div className="container py-4 text-primary bg-info">
            Custom index page for {resource.id}{' '}
            <Link href={route('resources.show', { resource: resource.id, id: '1' })}>
                Show item #1
            </Link>
        </div>
    );
}

function CustomResourceShowPage({ resource, itemId = null }: CustomResourcePageProps) {
    return (
        <div className="container py-4 text-primary bg-info">
            Custom show page for {resource.id} #{itemId}
        </div>
    );
}

const components = {
    [PAGES_NAMESPACE]: {
        CustomResourceIndexPage,
        CustomResourceShowPage,
    },
};

// Overrides the index and show pages of the "pages" resource
function withResourcePages(pages: Resource['pages']) {
    return {
        ...panneauDefinition,
        resources: panneauDefinition.resources.map((resource) =>
            resource.id === 'pages' ? { ...resource, pages } : resource,
        ),
    };
}

export const ResourcePageOverride = {
    name: 'Resource page override',
    render: () => (
        <PanneauContainer
            definition={withResourcePages({
                index: { component: 'custom-resource-index-page' },
                show: { component: 'custom-resource-show-page' },
            })}
            components={components}
            memoryRouter
            user={user}
            {...props}
        />
    ),
};

export const PanneauPageOverride = {
    name: 'Panneau page override (all resources)',
    render: () => (
        <PanneauContainer
            definition={{
                ...panneauDefinition,
                pages: {
                    index: { component: 'custom-resource-index-page' },
                },
            }}
            components={components}
            memoryRouter
            user={user}
            {...props}
        />
    ),
};

export const LegacyResourcePageOverride = {
    name: 'Resource page override (legacy keys)',
    render: () => (
        <PanneauContainer
            definition={withResourcePages({
                resourceIndexPage: { component: 'custom-resource-index-page' },
                resourceShowPage: { component: 'custom-resource-show-page' },
            })}
            components={components}
            memoryRouter
            user={user}
            {...props}
        />
    ),
};

// The duplicate page is not linked from the list, so the home page links to it
function DuplicateLinkHomePage() {
    const route = useUrlGenerator();
    return (
        <div className="container py-4">
            <Link href={route('resources.duplicate', { resource: 'pages', id: '1' })}>
                Duplicate page #1
            </Link>
        </div>
    );
}

// The duplicate page should keep its confirmation form even if the edit form has a custom component
export const DuplicateWithCustomEditForm = {
    name: 'Duplicate with custom edit form',
    render: () => (
        <PanneauContainer
            definition={{
                ...panneauDefinition,
                pages: { home: { component: 'duplicate-link-home-page' } },
                resources: panneauDefinition.resources.map((resource) =>
                    resource.id === 'pages'
                        ? {
                              ...resource,
                              forms: { ...resource.forms, edit: { component: 'normal' } },
                          }
                        : resource,
                ),
            }}
            components={{ [PAGES_NAMESPACE]: { DuplicateLinkHomePage } }}
            memoryRouter
            user={user}
            {...props}
        />
    ),
};
