/* eslint-disable react/jsx-props-no-spreading */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

const propTypes = {
    wrap: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
};

const defaultProps = {
    wrap: false,
    className: null,
    children: null,
};

const Column = ({ wrap, className, children }) =>
    wrap ? (
        <div
            className={classNames([
                {
                    'col-auto': wrap,
                    [className]: className !== null,
                },
            ])}
        >
            {children}
        </div>
    ) : (
        children
    );

Column.propTypes = propTypes;
Column.defaultProps = defaultProps;

export default Column;
