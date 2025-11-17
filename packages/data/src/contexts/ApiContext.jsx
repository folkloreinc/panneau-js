/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';

import { useUrlGenerator } from '@panneau/core/contexts';

import Api from '../lib/Api';

const ApiContext = React.createContext(null);

export const useApi = () => useContext(ApiContext);

const propTypes = {
    api: PropTypes.instanceOf(Api),
    baseUrl: PropTypes.string,
    onUnauthorized: PropTypes.func,
    children: PropTypes.node.isRequired,
};

export const ApiProvider = ({
    api: initialApi = null,
    baseUrl = undefined,
    onUnauthorized = null,
    children
}) => {
    const generateUrl = useUrlGenerator();
    const previousApi = useApi();
    const api = useMemo(
        () =>
            initialApi ||
            previousApi ||
            new Api({
                baseUrl,
                generateUrl,
                onUnauthorized,
            }),
        [previousApi, initialApi, baseUrl],
    );
    return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

ApiProvider.propTypes = propTypes;

export default ApiContext;
