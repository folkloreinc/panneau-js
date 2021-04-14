import PropTypes from 'prop-types';

export const message = PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string,
});

export const label = PropTypes.oneOfType([message, PropTypes.node]);

/**
 * Core
 */
export const menuItem = PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    label,
    url: PropTypes.string,
    external: PropTypes.bool,
    active: PropTypes.bool,
});
export const menuItems = PropTypes.arrayOf(menuItem);

export const button = PropTypes.shape({
    id: PropTypes.string,
    label,
    onClick: PropTypes.func,
});
export const buttons = PropTypes.arrayOf(button);

export const buttonTheme = PropTypes.oneOf([
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark',
    null,
]);

export const buttonSize = PropTypes.oneOf(['lg', 'sm', null]);

export const buttonType = PropTypes.oneOf(['button', 'submit']);

export const dropdownAlign = PropTypes.oneOf(['left', 'right']);

export const controlSize = PropTypes.oneOf(['lg', 'sm', null]);

export const formStatus = PropTypes.oneOf(['loading', 'success', 'error', null]);

export const fieldOption = PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
});
export const fieldOptions = PropTypes.arrayOf(fieldOption);

export const toggle = PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.string,
});
export const toggles = PropTypes.arrayOf(toggle);

/**
 * Definition
 */
export const routes = PropTypes.shape({
    'resources.index': PropTypes.string.isRequired,
    'resources.create': PropTypes.string.isRequired,
    'resources.store': PropTypes.string.isRequired,
    'resources.show': PropTypes.string.isRequired,
    'resources.edit': PropTypes.string.isRequired,
    'resources.update': PropTypes.string.isRequired,
    'resources.destroy': PropTypes.string.isRequired,
});

export const localization = PropTypes.shape({
    locale: PropTypes.string,
    messages: PropTypes.objectOf(PropTypes.string),
});

export const field = PropTypes.shape({
    type: PropTypes.string.isRequired,
    name: PropTypes.isRequired,
    component: PropTypes.string.isRequired,
    label: PropTypes.isRequired,
});
export const fields = PropTypes.arrayOf(field);

export const resource = PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    fields,
});
export const resources = PropTypes.arrayOf(resource);

export const panneauDefinition = PropTypes.shape({
    name: PropTypes.string,
    resources,
    routes,
    // localization,
});

export const definition = PropTypes.shape({
    name: PropTypes.string,
    // resources,
    // routes,
    // localization,
});

export const item = PropTypes.shape({
    id: PropTypes.string.isRequired,
});
export const items = PropTypes.arrayOf(item);

export const user = PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
});

export const users = PropTypes.arrayOf(user);

/**
 * Fields
 */

 export const selectOption = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
        value: PropTypes.any, // eslint-disable-line
        label,
    }),
]);
export const selectOptions = PropTypes.arrayOf(selectOption);