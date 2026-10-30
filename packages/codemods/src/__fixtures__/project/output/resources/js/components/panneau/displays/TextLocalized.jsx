// TODO(panneau-5): `useLocales` of `@panneau/core/contexts`: `useFieldsContext().locales` of `@panneau/fields`
import { useLocales } from '@panneau/core/contexts';
import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    value: PropTypes.objectOf(PropTypes.string),
};

const defaultProps = {
    value: null,
};

function TextLocalizedDisplay({ value }) {
    const [locale = 'fr'] = useLocales();
    // TODO(panneau-5): Bootstrap class `text-muted` in `className`: Panneau 5 has no Bootstrap (`@panneau/ui` primitives, CSS Modules, or the Bootstrap-compatible theme)
    return <span className="text-muted">{value !== null ? value[locale] || null : null}</span>;
}

TextLocalizedDisplay.propTypes = propTypes;
TextLocalizedDisplay.defaultProps = defaultProps;

export default TextLocalizedDisplay;
