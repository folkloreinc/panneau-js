import React from 'react';
import PropTypes from 'prop-types';
// import classNames from 'classnames';
// import { FormattedMessage } from 'react-intl';

import styles from './styles.module.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

const DefaultForm = ({ className }) => {
    return <p className={styles.container}>Form</p>;
};

DefaultForm.propTypes = propTypes;
DefaultForm.defaultProps = defaultProps;

export default DefaultForm;
