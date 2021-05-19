import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

const propTypes = {
    value: PropTypes.string,
};

const defaultProps = {
    value: null,
};

const TextLocalized = ({ value }) => {
    const { locale } = useIntl();
    return <>{value !== null ? value[locale] || null : null}</>;
};
TextLocalized.propTypes = propTypes;
TextLocalized.defaultProps = defaultProps;

export default TextLocalized;
