/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const propTypes = {
    horizontal: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.string,
};

const defaultProps = {
    horizontal: false,
    className: null,
    children: null,
};

const Column = ({ horizontal, className, children }) => {
    return horizontal ? (
        <div
            className={classNames([
                {
                    'col-auto': horizontal,
                    [className]: className !== null,
                },
            ])}
        >
            {children}
        </div>
    ) : (
        children
    );
};

Column.propTypes = propTypes;
Column.defaultProps = defaultProps;

export default Column;
