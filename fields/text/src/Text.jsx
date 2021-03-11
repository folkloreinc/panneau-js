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

const TextField = ({ className }) => {
    return <p className={styles.container}>Hello</p>;
};

TextField.propTypes = propTypes;
TextField.defaultProps = defaultProps;

export default TextField;
