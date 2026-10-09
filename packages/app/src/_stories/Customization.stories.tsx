import definition from '../../../../.storybook/data/definition';
import { eventsResource } from '../../../../.storybook/data/resources';
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

/** On the resource: pages: { resourceShowPage: { component: 'event-show-page' } } */
export const ResourcePageOverride = {
    name: 'Resource page override',
    render: () => (
        <AppStory
            path="/events/1"
            definition={{
                ...definition,
                resources: definition.resources.map((resource) =>
                    resource.id === eventsResource.id
                        ? {
                              ...resource,
                              pages: {
                                  resourceShowPage: { component: 'event-show-page' },
                              },
                          }
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

/** intl: { locale: 'en' } */
export const English = {
    parameters: {
        intl: { locale: 'en' },
    },
    render: () => (
        <AppStory
            path="/events"
            definition={{ ...definition, intl: { locale: 'en', locales: ['en', 'fr'] } }}
        />
    ),
};
