import type { PanneauDefinition } from '@panneau/core';

import resources from './resources';

/**
 * Panneau definition of a fictive festival website, used by the App stories.
 *
 * The `component` names of pages and custom routes are resolved in the "pages"
 * namespace of the `components` prop given to the container
 * (ex: 'statistics-page' -> components.pages.StatisticsPage).
 */
const definition: PanneauDefinition = {
    name: 'Festival',

    intl: {
        locale: 'fr',
        locales: ['fr', 'en'],
    },

    routes: {
        home: '/',
        account: '/account',
        'auth.login': '/login',
        'auth.logout': '/logout',

        'resources.index': '/:resource',
        'resources.create': '/:resource/create',
        'resources.store': '/:resource',
        'resources.show': '/:resource/:id',
        'resources.edit': '/:resource/:id/edit',
        'resources.update': '/:resource/:id',
        'resources.delete': '/:resource/:id/delete',
        'resources.destroy': '/:resource/:id',
        'resources.duplicate': '/:resource/:id/duplicate',
        'resources.clone': '/:resource/:id/clone',
        'resources.restore': '/:resource/:id/restore',

        // Custom page: a route with a component
        statistics: {
            path: '/statistiques',
            component: 'statistics-page',
        },
    },

    resources,

    menus: {
        main: [
            // Menu of all the resources (except the ones with settings.hideInNavbar)
            'resources',
            {
                id: 'statistics',
                label: 'Statistiques',
                href: '/statistiques',
            },
            {
                id: 'links',
                label: 'Liens',
                dropdown: [
                    {
                        id: 'website',
                        label: 'Voir le site',
                        href: 'https://example.com',
                        external: true,
                    },
                    {
                        id: 'docs',
                        label: 'Documentation Panneau',
                        href: 'https://github.com/folkloreinc/panneau-js',
                        external: true,
                    },
                ],
            },
            // Pushes the next items to the right
            'separator',
            'account',
        ],
    },

    theme: {
        colorScheme: 'light',
    },
};

export default definition;
