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
    return <span className="text-muted">{value !== null ? value[locale] || null : null}</span>;
}

TextLocalizedDisplay.propTypes = propTypes;
TextLocalizedDisplay.defaultProps = defaultProps;

export default TextLocalizedDisplay;
