import React from 'react';
import PropTypes from 'prop-types';
import { ConnectedRouter } from 'connected-react-router';

const propTypes = {
    children: PropTypes.node,
};

const defaultProps = {
    children: null,
};

const RouterContainer = ({ children, ...props }) => (
    <ConnectedRouter {...props}>{children}</ConnectedRouter>
);

RouterContainer.propTypes = propTypes;
RouterContainer.defaultProps = defaultProps;

export default RouterContainer;
