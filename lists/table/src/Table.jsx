/* eslint-disable react/no-array-index-key, react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

// import { PropTypes as PanneauPropTypes } from '@panneau/core';
// import Label from '@panneau/element-label';
// import Buttons from '@panneau/element-buttons';

import styles from './styles.module.scss';

const propTypes = {
    className: PropTypes.string,
};

const defaultProps = {
    className: null,
};

const TableList = ({ className }) => (
    <div
        className={classNames([
            'modal-dialog',
            styles.container,
            {
                [className]: className,
            },
        ])}
        role="dialog"
    >
        Table
    </div>
);

TableList.propTypes = propTypes;
TableList.defaultProps = defaultProps;

export default TableList;
