import React from 'react';
import PropTypes from 'prop-types';

import styles from './styles.module.scss';

const propTypes = {
    value: PropTypes.string,
};

const defaultProps = {
    value: null,
};

const Text = ({ value }) => <div className={styles.container}>{value}</div>;
Text.propTypes = propTypes;
Text.defaultProps = defaultProps;

export default Text;
