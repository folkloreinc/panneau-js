import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.string,
};

const defaultProps = {
    value: null,
};

const TextLocalized = ({ value }) => {
    const { locale } = useIntl();
    return <div className={styles.container}>{value !== null ? value[locale] || null : null}</div>;
};
TextLocalized.propTypes = propTypes;
TextLocalized.defaultProps = defaultProps;

export default TextLocalized;
