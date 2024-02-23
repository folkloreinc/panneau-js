/* eslint-disable react/jsx-props-no-spreading */
// import { PropTypes as PanneauPropTypes } from '@panneau/core';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearch } from 'wouter';

import { useApi } from '@panneau/data';
import Select from '@panneau/element-select';

const propTypes = {
    options: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.any, // eslint-disable-line react/forbid-prop-types
        }),
    ),
    requestUrl: PropTypes.string,
    requestOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    requestQuery: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    requestParams: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    itemValuePath: PropTypes.string,
    itemLabelPath: PropTypes.string,
    maxItemsCount: PropTypes.number,
    className: PropTypes.string,
};

const defaultProps = {
    options: [],
    requestUrl: null,
    requestOptions: null,
    requestQuery: null,
    requestParams: null,
    itemValuePath: null,
    itemLabelPath: null,
    maxItemsCount: null,
    className: null,
};

const SelectFilter = ({
    options: initialOptions,
    requestUrl,
    requestOptions,
    requestQuery,
    requestParams,
    itemValuePath,
    itemLabelPath,
    maxItemsCount,
    className,
    ...props
}) => {
    const api = useApi();
    const [options, setOptions] = useState(initialOptions || []);

    useEffect(() => {
        setOptions(initialOptions);
    }, [initialOptions, setOptions]);

    const search = useSearch();
    const query = useMemo(() => queryString.parse(search, { arrayFormat: 'bracket' }), [search]);

    const finalParams = useMemo(() => {
        const currentQuery = query || {};
        const currentParams = requestParams || [];
        return Object.keys(currentQuery).reduce((obj, name) => {
            const inParams = currentParams.find((p) => p === name) || null;
            if (inParams !== null && currentQuery[name]) {
                return {
                    ...obj,
                    [name]: currentQuery[name],
                };
            }
            return obj;
        }, {});
    }, [query, requestParams]);

    const fetchOptions = useCallback(
        (url) => {
            if (url !== null && api !== null) {
                api.requestGet(
                    url,
                    {
                        paginated: false,
                        ...requestQuery,
                        ...finalParams,
                    },
                    requestOptions,
                )
                    .then((newItems) => {
                        const partialItems =
                            newItems !== null &&
                            !isArray(newItems) &&
                            typeof newItems.data !== 'undefined'
                                ? newItems.data || []
                                : newItems;
                        const finalItems =
                            maxItemsCount !== null
                                ? partialItems.slice(0, maxItemsCount)
                                : partialItems;
                        setOptions(
                            (finalItems || []).map((it) => ({
                                label: get(it, itemLabelPath, null),
                                value: get(it, itemValuePath, null),
                            })),
                        );
                    })
                    .catch(() => {
                        setOptions(initialOptions);
                    });
            }
        },
        [
            api,
            initialOptions,
            maxItemsCount,
            requestQuery,
            requestOptions,
            finalParams,
            itemLabelPath,
            itemValuePath,
        ],
    );

    useEffect(() => {
        fetchOptions(requestUrl);
    }, [requestUrl, finalParams]);

    return <Select autoSize {...props} className={className} options={options} />;
};

SelectFilter.propTypes = propTypes;
SelectFilter.defaultProps = defaultProps;

export default SelectFilter;
