import get from 'lodash/get';
import isObject from 'lodash/isObject';

const parseDefinition = (rootDefinition) => {
    const parseNavbarItem = (definition) => {
        const type = get(definition, 'type', 'item');
        if (type === 'resource') {
            const resourceName = get(definition, 'resource', null);
            // const dropdown = get(definition, 'dropdown', true);
            const resources = get(rootDefinition, 'resources', []);
            const resource = resources.find(it => it.id === resourceName) || null;
            if (resource === null) {
                return null;
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
            items: items.map((it, index) => parseNavbarItem(it, index)).filter(it => it !== null),
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

    const parseResources = resources => resources.map(({
        type, messages, ...resource
    }) => ({
        ...resource,
        type: type || 'default',
        messages: isObject(messages || null) ? messages : null,
    }));

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
