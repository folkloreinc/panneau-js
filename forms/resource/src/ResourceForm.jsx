import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
// import { FormattedMessage } from 'react-intl';

import styles from './styles.module.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

const ResourceForm = ({ className }) => {
    return (
        <p className={classNames([styles.container, { [className]: className !== null }])}>Form</p>
    );
};

ResourceForm.propTypes = propTypes;
ResourceForm.defaultProps = defaultProps;

export default ResourceForm;
