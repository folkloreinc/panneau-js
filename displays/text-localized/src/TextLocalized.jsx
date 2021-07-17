import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from 'react-intl';

const propTypes = {
    value: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    locale: PropTypes.string,
};

const defaultProps = {
    value: null,
    locale: null,
};

const TextLocalized = ({ value, locale: parentLocale }) => {
    const { locale } = useIntl();
    return <>{value !== null ? value[parentLocale || locale] || null : null}</>;
};
TextLocalized.propTypes = propTypes;
TextLocalized.defaultProps = defaultProps;

export default TextLocalized;
