import PropTypes from 'prop-types';

const componentsCollection = PropTypes.shape({
    getComponent: PropTypes.func,
    getCollection: PropTypes.func,
});

const definition = PropTypes.shape({
    layout: PropTypes.shape({

    }),
    routes: PropTypes.objectOf(PropTypes.string),
    resources: PropTypes.arrayOf(PropTypes.shape({

    })),
});

const field = PropTypes.shape({
    type: PropTypes.string,
    name: PropTypes.string,
});

const fields = PropTypes.arrayOf(field);

const resource = PropTypes.shape({
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

const intlMessage = PropTypes.shape({
    id: PropTypes.string,
    description: PropTypes.string,
    defaultMessage: PropTypes.string,
});

const message = PropTypes.oneOfType([
    PropTypes.string,
    intlMessage,
]);

const label = PropTypes.oneOfType([
    PropTypes.node,
    intlMessage,
]);

const button = PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    label: message,
    className: PropTypes.string,
    onClick: PropTypes.func,
});

const buttons = PropTypes.arrayOf(button);

export default {
    componentsCollection,
    definition,
    resource,
    field,
    fields,
    button,
    intlMessage,
    message,
    label,
    buttons,
};
