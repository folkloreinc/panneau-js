/* eslint-disable react/jsx-props-no-spreading */
import { generatePath } from '@folklore/routes';
import { useFormValue } from '@panneau/core/contexts';
import TextField from '@panneau/field-text';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

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
    const page = useFormValue();
    const { parent = null } = page || {};
    const { slug: parentSlug = null } = parent || {};
    const url =
        parent !== null
            ? generatePath(routes.page_with_parent, { parent: parentSlug[fieldLocale], page: '' })
            : generatePath(routes.page, { page: '' });
    return (
        <TextField
            prepend={`${window.location.protocol}//${window.location.host}${url}`}
            className={classNames(['flex-nowrap', { [className]: className !== null }])}
            value={value}
            {...props}
        />
    );
}

PageSlugField.propTypes = propTypes;
PageSlugField.defaultProps = defaultProps;

export default PageSlugField;
