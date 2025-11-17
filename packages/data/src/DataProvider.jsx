/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';

import { ApiProvider } from './contexts/ApiContext';
import Api from './lib/Api';

const propTypes = {
    api: PropTypes.instanceOf(Api),
    apiBaseUrl: PropTypes.string,
    children: PropTypes.node,
};

const DataProvider = ({
    api = null,
    apiBaseUrl = undefined,
    children = null
}) => (
    <ApiProvider api={api} baseUrl={apiBaseUrl}>
        {children}
    </ApiProvider>
);

DataProvider.propTypes = propTypes;

export default DataProvider;
