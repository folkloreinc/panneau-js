/* eslint-disable react/jsx-props-no-spreading */
// import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getCSRFHeaders, getJSON } from '@folklore/fetch';
import get from 'lodash-es/get';
import isArray from 'lodash-es/isArray';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearch } from 'wouter';

// import { useApi } from '@panneau/data';
import Select from '@panneau/element-select';

const propTypes = {
    onChange: PropTypes.func.isRequired,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
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
    paginated: PropTypes.bool,
    clearValue: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    autoSize: PropTypes.bool,
    className: PropTypes.string,
};

const defaultProps = {
    options: null,
    requestUrl: null,
    requestOptions: null,
    requestQuery: null,
    requestParams: null,
    itemValuePath: null,
    itemLabelPath: null,
    maxItemsCount: null,
    paginated: false,
    clearValue: null,
    autoSize: false,
    className: null,
};

const SelectFilter = ({
    onChange,
    options: initialOptions,
    requestUrl,
    requestOptions,
    requestQuery,
    requestParams,
    itemValuePath,
    itemLabelPath,
    maxItemsCount,
    paginated,
    clearValue,
    autoSize,
    className,
    ...props
}) => {
    const [options, setOptions] = useState(initialOptions || null);
    const [loading, setLoading] = useState(null);
    const [endReached, setEndReached] = useState(false);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        setOptions(initialOptions || null);
    }, [initialOptions, setOptions]);

    const search = useSearch();
    const [page, setPage] = useState(1);
    const query = useMemo(
        () => ({
            ...(paginated ? { page } : null),
            ...queryString.parse(search, { arrayFormat: 'bracket' }),
        }),
        [search, page, paginated],
    );

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
            if (paginated && (name === 'page' || name === 'count')) {
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
            if (!endReached && url !== null) {
                setLoading(true);
                const partialQuery = {
                    paginated,
                    ...requestQuery,
                    ...finalParams,
                };
                const finalQuery = queryString.stringify(partialQuery, { arrayFormat: 'bracket' });
                getJSON(
                    `${url}${finalQuery !== null && finalQuery.length > 0 ? `?${finalQuery}` : ''}`,
                    {
                        credentials: 'include',
                        headers: getCSRFHeaders(),
                        ...requestOptions,
                    },
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

                        if (paginated) {
                            const oldPagination =
                                newItems !== null &&
                                !isArray(newItems) &&
                                typeof newItems.meta !== 'undefined'
                                    ? newItems.meta || {}
                                    : null;
                            const newPagination =
                                newItems !== null &&
                                !isArray(newItems) &&
                                typeof newItems.pagination !== 'undefined'
                                    ? newItems.pagination || {}
                                    : null;
                            setOptions([
                                ...(options || []),
                                ...(finalItems || []).map((it) => ({
                                    label: get(it, itemLabelPath, null),
                                    value: get(it, itemValuePath, null),
                                })),
                            ]);
                            setPagination(newPagination || oldPagination);
                        } else {
                            setOptions(
                                (finalItems || []).map((it) => ({
                                    label: get(it, itemLabelPath, null),
                                    value: get(it, itemValuePath, null),
                                })),
                            );
                            setPagination(null);
                        }
                        setLoading(false);
                    })
                    .catch(() => {
                        setOptions(initialOptions);
                        setPagination(null);
                        setLoading(false);
                    });
            }
        },
        [
            options,
            initialOptions,
            maxItemsCount,
            requestQuery,
            requestOptions,
            finalParams,
            itemLabelPath,
            itemValuePath,
            paginated,
            setOptions,
            setPagination,
            setLoading,
            endReached,
        ],
    );

    useEffect(() => {
        fetchOptions(requestUrl);
    }, [requestUrl, finalParams]);

    useEffect(() => {
        if (!paginated) {
            setPagination(null);
        }
    }, [paginated]);

    const onMenuScrollToBottom = useCallback(() => {
        if (!loading && paginated && pagination !== null) {
            const { page: paginationPage, last_page: lastPage } = pagination || {};
            if (paginationPage < lastPage) {
                setPage(paginationPage + 1);
            } else {
                setEndReached(true);
            }
        }
    }, [loading, page, setPage, paginated, pagination, setEndReached]);

    const finalOnChange = useCallback(
        (val) => {
            const newValue = isArray(val) && val.length === 0 ? null : val;
            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange],
    );

    return (
        <Select
            autoSize={autoSize}
            {...props}
            onChange={finalOnChange}
            clearValue={clearValue}
            className={className}
            options={options || []}
            onMenuScrollToBottom={paginated ? onMenuScrollToBottom : null}
        />
    );
};

SelectFilter.propTypes = propTypes;
SelectFilter.defaultProps = defaultProps;

export default SelectFilter;
