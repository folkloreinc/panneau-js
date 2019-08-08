import PropTypes from 'prop-types';

import UrlGenerator from './UrlGenerator';
import ResourceApi from './ResourceApi';
import ComponentsCollection from './ComponentsCollection';

/**
 * Core
 */
export const urlGenerator = PropTypes.instanceOf(UrlGenerator);

export const history = PropTypes.shape({
    push: PropTypes.func.isRequired,
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

export const componentsCollection = PropTypes.instanceOf(ComponentsCollection);

export const components = PropTypes.oneOfType([
    PropTypes.objectOf(PropTypes.elementType),
    PropTypes.instanceOf(ComponentsCollection),
]);

export const resourceApi = PropTypes.instanceOf(ResourceApi);

export const ref = PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.elementType }),
]);

/**
 * UI
 */
export const message = PropTypes.oneOfType([PropTypes.string, intlMessage]);

export const label = PropTypes.oneOfType([PropTypes.node, intlMessage]);

export const button = PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    href: PropTypes.string,
    external: PropTypes.bool,
    label: message,
    children: message,
    className: PropTypes.string,
    onClick: PropTypes.func,
});

export const buttons = PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.node, button]));

export const dropdownItem = PropTypes.shape({
    id: PropTypes.string,
    href: PropTypes.string,
    external: PropTypes.bool,
    label: message,
    className: PropTypes.string,
    onClick: PropTypes.func,
});

export const dropdownItems = PropTypes.arrayOf(dropdownItem);

export const errors = PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]);

export const buttonSize = PropTypes.oneOf(['sm', 'md', 'lg']);

export const buttonStyle = PropTypes.oneOf([
    null,
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark',
    'link',
    'outline-primary',
    'outline-secondary',
    'outline-success',
    'outline-danger',
    'outline-warning',
    'outline-info',
    'outline-light',
    'outline-dark',
    'outline-link',
]);

/**
 * Models
 */
export const user = PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string,
    email: PropTypes.string,
});

/**
 * Definition
 */
export const fieldDefinition = PropTypes.shape({
    type: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
});

export const fieldsDefinition = PropTypes.arrayOf(fieldDefinition)

export const formDefinition = PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string,
    fields: PropTypes.oneOfType([
        PropTypes.objectOf(fieldsDefinition),
        fieldsDefinition
    ]),
});

export const formsDefinition = PropTypes.oneOfType([
    formDefinition,
    PropTypes.objectOf(formDefinition),
]);

export const resourceDefinition = PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    messages: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    forms: formsDefinition,
});

export const resourcesDefinition = PropTypes.arrayOf(resourceDefinition);

export const layoutDefinition = PropTypes.shape({
   type: PropTypes.string,
});

export const definition = PropTypes.shape({
    layout: layoutDefinition,
    routes: PropTypes.shape({
        home: PropTypes.string.isRequired,
        account: PropTypes.string.isRequired,
        'resource.index': PropTypes.string.isRequired,
        'resource.create': PropTypes.string.isRequired,
        'resource.store': PropTypes.string.isRequired,
        'resource.show': PropTypes.string.isRequired,
        'resource.edit': PropTypes.string.isRequired,
        'resource.update': PropTypes.string.isRequired,
        'resource.destroy': PropTypes.string.isRequired,
    }),
    resources: resourcesDefinition,
});
