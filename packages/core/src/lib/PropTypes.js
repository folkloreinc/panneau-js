import PropTypes from 'prop-types';

export const componentsCollection = PropTypes.shape({
    getComponent: PropTypes.func,
    getCollection: PropTypes.func,
});

export const layoutDefinition = PropTypes.shape({
    type: PropTypes.string,
});

export const resourceDefinition = PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    messages: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
});

export const resourcesDefinition = PropTypes.arrayOf(resourceDefinition);

export const definition = PropTypes.shape({
    layout: layoutDefinition,
    routes: PropTypes.objectOf(PropTypes.string),
    resources: resourcesDefinition,
});

export const field = PropTypes.shape({
    type: PropTypes.string,
    name: PropTypes.string,
});

export const fields = PropTypes.arrayOf(field);

export const resource = PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    messages: PropTypes.oneOfType([
        PropTypes.objectOf(PropTypes.string),
        PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    ]),
    forms: PropTypes.shape({
        type: PropTypes.string,
        fields: PropTypes.oneOfType([
            fields,
            PropTypes.objectOf(fields),
        ]),
    }),
});

export const urlGenerator = PropTypes.shape({
    route: PropTypes.func.isRequired,
});

export const intl = PropTypes.shape({
    locale: PropTypes.string.isRequired,
    formatMessage: PropTypes.func.isRequired,
});

export const intlMessage = PropTypes.shape({
    id: PropTypes.string,
    description: PropTypes.string,
    defaultMessage: PropTypes.string,
});

export const message = PropTypes.oneOfType([
    PropTypes.string,
    intlMessage,
]);

export const label = PropTypes.oneOfType([
    PropTypes.node,
    intlMessage,
]);

export const button = PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    label: message,
    className: PropTypes.string,
    onClick: PropTypes.func,
});

export const buttons = PropTypes.arrayOf(button);

export default {
    componentsCollection,
    definition,
    resource,
    field,
    fields,
    button,
    intl,
    intlMessage,
    urlGenerator,
    message,
    label,
    buttons,
};
