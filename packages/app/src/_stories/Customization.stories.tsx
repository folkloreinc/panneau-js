import type { Resource } from '@panneau/core';

import { resourceValues } from '../../../../.storybook/data/utils';

import definition from '../../../../.storybook/data/definition';
import { eventsResource, jobListingsResource } from '../../../../.storybook/data/resources';
import AppStory from './components/AppStory';

/**
 * How to customize the app from the definition. The custom components are in
 * ./components and are given to the container with the `components` prop.
 */
export default {
    title: 'App/Customization',
    component: AppStory,
    parameters: {
        intl: { locale: 'fr' },
        router: false,
        layout: 'fullscreen',
    },
};

/** pages: { home: { component: 'dashboard-page' } } */
export const CustomHomePage = {
    name: 'Custom home page',
    render: () => (
        <AppStory
            path="/"
            definition={{
                ...definition,
                pages: {
                    home: { component: 'dashboard-page' },
                },
            }}
        />
    ),
};

/** routes: { statistics: { path: '/statistiques', component: 'statistics-page' } } */
export const CustomRoute = {
    name: 'Custom route',
    render: () => <AppStory path="/statistiques" />,
};

function withEventsPages(pages: Resource['pages']) {
    return {
        ...definition,
        resources: definition.resources.map((resource) =>
            resource.id === eventsResource.id ? { ...resource, pages } : resource,
        ),
    };
}

/** On the resource: pages: { show: { component: 'event-show-page' } } */
export const ResourcePageOverride = {
    name: 'Resource page override',
    render: () => (
        <AppStory
            path="/events/1"
            definition={withEventsPages({
                show: { component: 'event-show-page' },
            })}
        />
    ),
};

/** The legacy keys still work: pages: { resourceShowPage: { component: 'event-show-page' } } */
export const ResourcePageOverrideLegacy = {
    name: 'Resource page override (legacy keys)',
    render: () => (
        <AppStory
            path="/events/1"
            definition={withEventsPages({
                resourceShowPage: { component: 'event-show-page' },
            })}
        />
    ),
};

/** forms: { edit: { component: 'normal' } } does not replace the duplicate confirmation */
export const DuplicateWithCustomEditForm = {
    name: 'Duplicate with custom edit form',
    render: () => (
        <AppStory
            path="/pages/1/duplicate"
            definition={{
                ...definition,
                resources: definition.resources.map((resource) =>
                    resource.id === 'pages'
                        ? {
                              ...resource,
                              forms: { ...resource.forms, edit: { component: 'normal' } },
                          }
                        : resource,
                ),
            }}
        />
    ),
};

/** Without `index.columns`, the fields with settings.showInIndex are the columns */
export const ColumnsFromFields = {
    name: 'Columns from fields',
    render: () => (
        <AppStory
            path="/jobListings"
            definition={{
                ...definition,
                resources: definition.resources.map((resource) =>
                    resource.id === jobListingsResource.id
                        ? { ...resource, index: { ...resource.index, columns: undefined } }
                        : resource,
                ),
            }}
        />
    ),
};

/** Hide a resource from the menu with settings.hideInNavbar */
export const HiddenResource = {
    name: 'Resource hidden in navbar',
    render: () => (
        <AppStory
            path="/"
            definition={{
                ...definition,
                resources: definition.resources.map((resource) =>
                    resource.id === 'medias'
                        ? { ...resource, settings: { ...resource.settings, hideInNavbar: true } }
                        : resource,
                ),
            }}
        />
    ),
};

/** theme: { colorScheme: 'dark' } */
export const DarkMode = {
    name: 'Dark mode',
    render: () => (
        <AppStory path="/pages" definition={{ ...definition, theme: { colorScheme: 'dark' } }} />
    ),
};

// The labels written in the definition are not translated: give them in English
function english(name: string, singular: string, plural: string, a: string = 'a') {
    return {
        name,
        values: resourceValues({
            name: singular,
            singular,
            plural,
            aSingular: `${a} ${singular}`,
            theSingular: `the ${singular}`,
            thePlural: `the ${plural}`,
        }),
    };
}

const englishResources = {
    pages: english('Pages', 'page', 'pages'),
    events: english('Events', 'event', 'events', 'an'),
    persons: english('Team', 'person', 'team'),
    jobListings: english('Jobs', 'job listing', 'job listings'),
    medias: english('Medias', 'media', 'medias'),
};

/** intl: { locale: 'en' } */
export const English = {
    parameters: {
        intl: { locale: 'en' },
    },
    render: () => (
        <AppStory
            path="/events"
            definition={{
                ...definition,
                intl: { locale: 'en', locales: ['en', 'fr'] },
                resources: definition.resources.map((resource) => {
                    const { name, values } = englishResources[resource.id];
                    return { ...resource, name, intl: { values } };
                }),
            }}
        />
    ),
};
