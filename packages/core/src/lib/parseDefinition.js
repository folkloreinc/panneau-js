import get from 'lodash/get';
import isObject from 'lodash/isObject';
import { defineMessages } from 'react-intl';

import ResourceApi from './ResourceApi';
import messageWithValues from './messageWithValues';

const intlMessages = defineMessages({
    navbarViewAll: {
        id: 'core.navbar.resources.index',
        description: 'The label for a resource "view all" navbar menu',
        defaultMessage: 'View all { resource }',
    },
    navbarAddNew: {
        id: 'core.navbar.resources.create',
        description: 'The label for a resource "add new" navbar menu',
        defaultMessage: 'Add a new { resource }',
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
                const routeKeyPrefix = get(resource, 'routes', null)
                    ? `resource.${resource.id}`
                    : 'resource';
                const resourceItemLabel = get(
                    resource,
                    'messages.names.plural',
                    get(resource, 'name', resourceName),
                );
                const resourceViewAllLabel = get(
                    resource,
                    'messages.names.a_plural',
                    get(resource, 'name', resourceName),
                );
                const resourceAddNewLabel = get(
                    resource,
                    'messages.names.a',
                    get(resource, 'name', resourceName),
                );
                return {
                    label: resourceItemLabel,
                    link: urlGenerator.route(`${routeKeyPrefix}.index`, {
                        resource: resource.id,
                    }),
                    items: dropdown
                        ? [
                            {
                                label: messageWithValues(intlMessages.navbarViewAll, {
                                    resource: resourceViewAllLabel,
                                }),
                                link: urlGenerator.route(`${routeKeyPrefix}.index`, {
                                    resource: resource.id,
                                }),
                            },
                            { type: 'divider' },
                            {
                                label: messageWithValues(intlMessages.navbarAddNew, {
                                    resource: resourceAddNewLabel,
                                }),
                                link: urlGenerator.route(`${routeKeyPrefix}.create`, {
                                    resource: resource.id,
                                }),
                            },
                        ]
                        : null,
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

    const parseResources = resources =>
        resources.map(({
            type, messages, api, ...resource
        }) => {
            const endpointHost = get(rootDefinition, 'endpointHost', '/');
            return {
                ...resource,
                type: type || 'default',
                messages: isObject(messages || null) ? messages : null,
                api: (
                    api ||
                    new ResourceApi(resource, urlGenerator, {
                        host: endpointHost,
                    })
                ),
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
        endpointUploadMedia: '/mediatheque/upload',
        ...rootDefinition,
        resources: parseResources(resources),
        layout: parseLayout(layout),
    };
};

export default parseDefinition;
