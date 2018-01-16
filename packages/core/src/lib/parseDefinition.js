import get from 'lodash/get';

import ResourceApi from './ResourceApi';

const parseDefinition = (rootDefinition, { urlGenerator }) => {
    const parseNavbarItem = (definition) => {
        const type = get(definition, 'type', 'item');
        if (type === 'resource') {
            const resourceName = get(definition, 'resource', null);
            const dropdown = get(definition, 'dropdown', true);
            const resources = get(rootDefinition, 'resources', []);
            const resource = resources.find(it => it.id === resourceName) || null;
            if (resource) {
                return {
                    label: get(resource, 'name', resourceName),
                    link: urlGenerator.route('resource.index', {
                        resource: resource.id,
                    }),
                    items: dropdown ? [
                        {
                            label: 'View all users',
                            link: urlGenerator.route('resource.index', {
                                resource: resource.id,
                            }),
                        },
                        { type: 'divider' },
                        {
                            label: 'Add a new user',
                            link: urlGenerator.route('resource.create', {
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
