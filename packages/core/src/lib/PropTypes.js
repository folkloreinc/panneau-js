import PropTypes from 'prop-types';

export const message = PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string,
});

export const label = PropTypes.oneOfType([message, PropTypes.node]);

export const statusCode = PropTypes.oneOfType([PropTypes.number, PropTypes.string]);

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

export const buttonSize = PropTypes.oneOf(['lg', 'md', 'sm', null]);

export const buttonType = PropTypes.oneOf(['button', 'submit']);

export const dropdownAlign = PropTypes.oneOf(['start', 'end']);

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

export const tableColumn = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
        id: PropTypes.string,
        component: PropTypes.string,
        path: PropTypes.string,
        field: PropTypes.string,
        columnClassName: PropTypes.string,
    }),
]);

export const tableColumns = PropTypes.arrayOf(tableColumn);

/**
 * Panneau Definitions
 */
export const routes = PropTypes.shape({
    'resources.index': PropTypes.string.isRequired,
    'resources.create': PropTypes.string.isRequired,
    'resources.store': PropTypes.string.isRequired,
    'resources.show': PropTypes.string.isRequired,
    'resources.edit': PropTypes.string.isRequired,
    'resources.update': PropTypes.string.isRequired,
    'resources.delete': PropTypes.string.isRequired,
    'resources.destroy': PropTypes.string.isRequired,
});

export const intl = PropTypes.shape({
    locale: PropTypes.string,
    messages: PropTypes.objectOf(PropTypes.string),
    values: PropTypes.objectOf(PropTypes.string),
});

export const page = PropTypes.shape({
    component: PropTypes.string.isRequired,
});
export const pages = PropTypes.objectOf(page);

export const field = PropTypes.shape({
    name: PropTypes.string, // Not required on localized fields
    type: PropTypes.string,
    component: PropTypes.string,
    label: PropTypes.node,
});
export const fields = PropTypes.arrayOf(field);

export const form = PropTypes.shape({
    // type: PropTypes.string.isRequired,
    title: PropTypes.isRequired,
    fields,
});
export const forms = PropTypes.arrayOf(form);

export const resource = PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    intl,
    fields,
    forms: PropTypes.shape({}),
    shows_in_navbar: PropTypes.bool,
});
export const resources = PropTypes.arrayOf(resource);

export const panneauDefinition = PropTypes.shape({
    name: PropTypes.string,
    resources,
    routes,
    pages,
    intl,
    // intl,
});

export const definition = PropTypes.shape({
    name: PropTypes.string,
    // resources,
    // routes,
    // intl,
});

export const item = PropTypes.shape({
    id: PropTypes.string.isRequired,
});
export const items = PropTypes.arrayOf(item);

export const user = PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
});

export const users = PropTypes.arrayOf(user);

export const selectOption = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.shape({
        value: PropTypes.any, // eslint-disable-line
        label,
    }),
    PropTypes.object,
]);

export const selectOptions = PropTypes.arrayOf(selectOption);

export const feedback = PropTypes.oneOf(['valid', 'invalid', 'loading', null]);

export const formError = PropTypes.shape({ message: PropTypes.string });

export const formErrors = PropTypes.arrayOf(formError);

export const uppy = PropTypes.shape({ tus: PropTypes.object }); // eslint-disable-line

export const triggerUpdate = PropTypes.string;

export const breadcrumb = PropTypes.shape({
    url: PropTypes.string,
});

export const breadcrumbs = PropTypes.arrayOf(breadcrumb);

export const font = PropTypes.shape({
    // url: PropTypes.string,
});

export const fonts = PropTypes.arrayOf(font);

export const trackingVariables = PropTypes.shape({});

export const modal = PropTypes.shape({
    name: PropTypes.string,
});

export const modals = PropTypes.arrayOf(modal);

export const filter = PropTypes.shape({
    id: PropTypes.string,
    component: PropTypes.string,
});

export const filters = PropTypes.arrayOf(filter);

export const media = PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    thumbnail_url: PropTypes.string,
});
export const medias = PropTypes.arrayOf(media);
