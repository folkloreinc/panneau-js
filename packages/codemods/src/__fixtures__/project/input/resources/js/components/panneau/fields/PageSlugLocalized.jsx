/* eslint-disable react/jsx-props-no-spreading */
import { useFormValue } from '@panneau/core/contexts';
import LocalizedField from '@panneau/field-localized';
import PropTypes from 'prop-types';
import React from 'react';
import slugify from 'slugify';

function PageSlugLocalizedField({ value, locales, ...props }) {
    const { title = null } = useFormValue() || {};
    const finalValue = locales.reduce(
        (newValue, locale) =>
            (newValue || {})[locale]
                ? newValue
                : { ...newValue, [locale]: slugify((title || {})[locale] || '', { lower: true }) },
        value,
    );
    return <LocalizedField value={finalValue} locales={locales} helpText="Leave empty to use the title" {...props} />;
}

PageSlugLocalizedField.propTypes = {
    value: PropTypes.objectOf(PropTypes.string),
    locales: PropTypes.arrayOf(PropTypes.string),
};

PageSlugLocalizedField.defaultProps = {
    value: null,
    locales: ['fr', 'en'],
};

export default PageSlugLocalizedField;
