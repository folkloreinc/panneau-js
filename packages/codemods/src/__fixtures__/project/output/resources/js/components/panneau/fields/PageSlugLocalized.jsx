/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React from 'react';
import slugify from 'slugify';

import { LocalizedField } from '@panneau/fields/localized';
import { useFormState, useFormContext } from '@panneau/forms';
import { getFieldProps, useFieldsContext } from '@panneau/fields';

function PageSlugLocalizedField({ value, locales, ...props }) {
    const { title = null } = useFormState(useFormContext()).values || {};
    const finalValue = locales.reduce(
        (newValue, locale) =>
            (newValue || {})[locale]
                ? newValue
                : { ...newValue, [locale]: slugify((title || {})[locale] || '', { lower: true }) },
        value,
    );
    // TODO(panneau-5): `<LocalizedField>` has no `fieldComponent`: v4 rendered the `component` of the field (given by the spread props), `LocalizedField` of Panneau 5 renders the input of each locale with its children function: give it one
    return <LocalizedField value={finalValue} locales={locales} description="Leave empty to use the title" {...props} />;
}

PageSlugLocalizedField.propTypes = {
    value: PropTypes.objectOf(PropTypes.string),
    locales: PropTypes.arrayOf(PropTypes.string),
};

PageSlugLocalizedField.defaultProps = {
    value: null,
    locales: ['fr', 'en'],
};

// TODO(panneau-5): `PageSlugLocalizedField` renders every locale itself: its PHP field must not be `localized()`, which renders a field once per locale
/** The registry entry of `PageSlugLocalizedField` for Panneau 5: its props from the field (written by @panneau/codemods). */
export function PageSlugLocalizedFieldEntry(props) {
    const { locales } = useFieldsContext();
    return (
        <PageSlugLocalizedField
            {...props.field.settings}
            {...getFieldProps(props)}
            onChange={props.onChange}
            value={props.value}
            locales={locales}
        />
    );
}

export default PageSlugLocalizedField;
