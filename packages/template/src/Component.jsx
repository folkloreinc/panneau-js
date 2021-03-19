/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {
    children: null,
};

const Component = ({ children }) => <p>Hello wrld {children}</p>;

Component.propTypes = propTypes;
Component.defaultProps = defaultProps;

export default Component;
