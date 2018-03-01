import get from 'lodash/get';
import trimEnd from 'lodash/trimEnd';
import { defineMessages } from 'react-intl';

import ResourceApi from './ResourceApi';
import messageWithValues from './messageWithValues';

const messages = defineMessages({
    navbarViewAll: {
        id: 'core.navbar.resources.index',
        description: 'The label for a resource "view all" navbar menu',
        defaultMessage: 'View all { resourceLabel }',
    },
    navbarAddNew: {
        id: 'core.navbar.resources.create',
        description: 'The label for a resource "add new" navbar menu',
        defaultMessage: 'Add a new { resourceLabel }',
    },
});

const parseDefinition = (rootDefinition, { urlGenerator }) => {
    const parseNavbarItem = (definition) => {
        const type = get(definition, 'type', 'item');
        if (type === 'resource') {
            const resourceName = get(definition, 'resource', null);
            const dropdown = get(definition, 'dropdown', true);
            const resources = get(rootDefinition, 'resources', []);
            const resource = resources.find(it => it.id === resourceName) || null;
            if (resource) {
                const routeKeyPrefix = get(resource, 'routes', null) ? `resource.${resource.id}` : 'resource';
                const resourceActionsLabel = get(resource, 'name', resourceName);
                return {
                    label: resourceActionsLabel,
                    link: urlGenerator.route(`${routeKeyPrefix}.index`, {
                        resource: resource.id,
                    }),
                    items: dropdown ? [
                        {
                            label: messageWithValues(messages.navbarViewAll, {
                                resourceLabel: resourceActionsLabel.toLowerCase(),
                            }),
                            link: urlGenerator.route(`${routeKeyPrefix}.index`, {
                                resource: resource.id,
                            }),
                        },
                        { type: 'divider' },
                        {
                            label: messageWithValues(messages.navbarAddNew, {
                                resourceLabel: trimEnd(resourceActionsLabel.toLowerCase(), 's'), // naive
                            }),
                            link: urlGenerator.route(`${routeKeyPrefix}.create`, {
                                resource: resource.id,
                            }),
                        },
                    ] : null,
                };
            }
        }
        return {
            ...definition,
        };
    };

    const parseNavbar = (definition) => {
        const items = get(definition, 'items', []);
        return {
            ...definition,
            items: items.map((it, index) => parseNavbarItem(it, index)),
        };
    };

    const parseHeader = (definition) => {
        const navbar = get(definition, 'navbar', true);
        return {
            ...definition,
            navbar: navbar !== false ? parseNavbar(navbar) : false,
        };
    };

    const parseFooter = (definition) => {
        const navbar = get(definition, 'navbar', false);
        return {
            ...definition,
            navbar: navbar !== false ? parseNavbar(navbar) : false,
        };
    };

    const parseResources = resources => resources.map((resource) => {
        const endpointHost = get(rootDefinition, 'endpointHost', '/');
        return {
            type: 'default',
            ...resource,
            api: new ResourceApi(resource, urlGenerator, {
                host: endpointHost,
            }),
        };
    });

    const parseLayout = (definition) => {
        const header = get(definition, 'header', true);
        const footer = get(definition, 'footer', false);
        return {
            ...definition,
            header: header !== false ? parseHeader(header) : false,
            footer: footer !== false ? parseFooter(footer) : false,
        };
    };

    const resources = get(rootDefinition, 'resources', []);
    const layout = get(rootDefinition, 'layout', null);
    return {
        ...rootDefinition,
        resources: parseResources(resources),
        layout: parseLayout(layout),
    };
};

export default parseDefinition;
