/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// import { PropTypes as MicromagPropTypes } from '../../lib';
import Label from './Label';

import styles from '../../styles/partials/empty.module.scss';

const propTypes = {
    children: PropTypes.node,
    withoutBorder: PropTypes.bool,
    light: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    children: null,
    withoutBorder: false,
    light: false,
    className: null,
};

const Empty = ({ children, withoutBorder, light, className }) => (
    <div
        className={classNames([
            styles.container,
            {
                [styles.withoutBorder]: withoutBorder,
                [styles.light]: light,
                [className]: className,
            },
        ])}
    >
        <div className={styles.middle}>
            <Label>{children}</Label>
        </div>
    </div>
);

Empty.propTypes = propTypes;
Empty.defaultProps = defaultProps;

export default Empty;
