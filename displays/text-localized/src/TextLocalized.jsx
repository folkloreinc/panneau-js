/* eslint-disable react/jsx-no-useless-fragment */
import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from 'react-intl';

const propTypes = {
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    placeholder: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    locale: PropTypes.string,
};

const defaultProps = {
    value: null,
    placeholder: null,
    locale: null,
};

const TextLocalized = ({ value, placeholder, locale: parentLocale }) => {
    const { locale } = useIntl();
    return <>{value !== null ? value[parentLocale || locale] || placeholder : placeholder}</>;
};

TextLocalized.propTypes = propTypes;
TextLocalized.defaultProps = defaultProps;

export default TextLocalized;
