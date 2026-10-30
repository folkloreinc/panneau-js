/* eslint-disable react/jsx-props-no-spreading */
import { generatePath } from '@folklore/routes';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import { TextField } from '@panneau/fields/text';
import { useFormState, useFormContext } from '@panneau/forms';
import { getFieldProps } from '@panneau/fields';

const propTypes = {
    routes: PropTypes.objectOf(PropTypes.string).isRequired,
    fieldLocale: PropTypes.string,
    value: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    fieldLocale: null,
    value: null,
    className: null,
};

function PageSlugField({ routes, fieldLocale, value, className, ...props }) {
    const page = useFormState(useFormContext()).values;
    const { parent = null } = page || {};
    const { slug: parentSlug = null } = parent || {};
    const url =
        parent !== null
            ? generatePath(routes.page_with_parent, { parent: parentSlug[fieldLocale], page: '' })
            : generatePath(routes.page, { page: '' });
    return (
        <TextField
            prefix={`${window.location.protocol}//${window.location.host}${url}`}
            className={classNames(['flex-nowrap', { [className]: className !== null }])}
            value={value}
            {...props}
        />
    );
}

PageSlugField.propTypes = propTypes;
PageSlugField.defaultProps = defaultProps;

// TODO(panneau-5): `PageSlugFieldEntry` reads `routes` from the `settings` of the field: give it with `settings()` of the PHP field
/** The registry entry of `PageSlugField` for Panneau 5: its props from the field (written by @panneau/codemods). */
export function PageSlugFieldEntry(props) {
    return (
        <PageSlugField
            {...props.field.settings}
            {...getFieldProps(props)}
            routes={props.field.settings?.routes}
            fieldLocale={props.locale}
            value={props.value}
        />
    );
}

export default PageSlugField;
