// import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getCSRFHeaders, getJSON } from '@folklore/fetch';
import get from 'lodash-es/get';
import isArray from 'lodash-es/isArray';
import queryString from 'query-string';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearch } from 'wouter';

// import { useApi } from '@panneau/data';
import type { SelectOption } from '@panneau/core/types';
import Select from '@panneau/element-select';

interface SelectFilterProps {
    onChange: (value: unknown) => void;
    options?: SelectOption[] | null;
    requestUrl?: string | null;
    requestOptions?: Record<string, unknown> | null;
    requestQuery?: Record<string, unknown> | null;
    requestParams?: string[] | null;
    itemSearchParam?: string | null;
    itemValuePath?: string | null;
    itemLabelPath?: string | null;
    maxItemsCount?: number | null;
    paginated?: boolean;
    searchable?: boolean;
    clearValue?: unknown;
    autoSize?: boolean;
    className?: string | null;
}

interface PaginationMeta {
    page?: number;
    last_page?: number;
    [key: string]: unknown;
}

interface ApiResponse {
    data?: SelectOption[];
    meta?: PaginationMeta;
    pagination?: PaginationMeta;
    [key: string]: unknown;
}

function SelectFilter({
    onChange,
    options: initialOptions = null,
    requestUrl = null,
    requestOptions = null,
    requestQuery = null,
    requestParams = null,
    itemSearchParam = null,
    itemValuePath = null,
    itemLabelPath = null,
    maxItemsCount = null,
    paginated = false,
    searchable = true,
    clearValue = null,
    autoSize = false,
    className = null,
    ...props
}: SelectFilterProps) {
    const [options, setOptions] = useState<SelectOption[] | null>(initialOptions || null);
    const [loading, setLoading] = useState<boolean | null>(null);
    const [endReached, setEndReached] = useState(false);
    const [pagination, setPagination] = useState<PaginationMeta | null>(null);

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
        return Object.keys(currentQuery).reduce(
            (obj, name) => {
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
            },
            {} as Record<string, unknown>,
        );
    }, [query, requestParams, paginated]);

    const fetchOptions = useCallback(
        (url: string | null, extraParams: Record<string, unknown> | null = null) => {
            if (!endReached && url !== null) {
                setLoading(true);
                const partialQuery = {
                    paginated,
                    ...requestQuery,
                    ...finalParams,
                    ...extraParams,
                };
                const finalQuery = queryString.stringify(partialQuery, { arrayFormat: 'bracket' });
                return getJSON(
                    `${url}${finalQuery !== null && finalQuery.length > 0 ? `?${finalQuery}` : ''}`,
                    {
                        credentials: 'include',
                        headers: getCSRFHeaders(),
                        ...requestOptions,
                    },
                )
                    .then((newItems: SelectOption[] | ApiResponse) => {
                        const partialItems =
                            newItems !== null &&
                            !isArray(newItems) &&
                            typeof (newItems as ApiResponse).data !== 'undefined'
                                ? (newItems as ApiResponse).data || []
                                : (newItems as SelectOption[]);
                        const finalItems =
                            maxItemsCount !== null
                                ? partialItems.slice(0, maxItemsCount)
                                : partialItems;

                        let result: SelectOption[] | null = null;

                        if (paginated) {
                            const oldPagination =
                                newItems !== null &&
                                !isArray(newItems) &&
                                typeof (newItems as ApiResponse).meta !== 'undefined'
                                    ? (newItems as ApiResponse).meta || {}
                                    : null;
                            const newPagination =
                                newItems !== null &&
                                !isArray(newItems) &&
                                typeof (newItems as ApiResponse).pagination !== 'undefined'
                                    ? (newItems as ApiResponse).pagination || {}
                                    : null;
                            result = [...(options || []), ...(finalItems || [])];
                            // .map((it) => ({
                            //     label: get(it, itemLabelPath, null),
                            //     value: get(it, itemValuePath, null),
                            // })),
                            setOptions(result);
                            setPagination(
                                (newPagination || oldPagination) as PaginationMeta | null,
                            );
                        } else {
                            result = finalItems || [];
                            setOptions(result);
                            setPagination(null);
                        }
                        setLoading(false);

                        return result;
                    })
                    .catch(() => {
                        setOptions(initialOptions);
                        setPagination(null);
                        setLoading(false);
                        return null;
                    });
            }
            return null;
        },
        [
            options,
            initialOptions,
            maxItemsCount,
            requestQuery,
            requestOptions,
            finalParams,
            paginated,
            setOptions,
            setPagination,
            setLoading,
            endReached,
        ],
    );

    useEffect(() => {
        fetchOptions(requestUrl);
    }, [requestUrl, finalParams, fetchOptions]);

    useEffect(() => {
        if (!paginated) {
            setPagination(null);
        }
    }, [paginated]);

    const onMenuScrollToBottom = useCallback(() => {
        if (!loading && paginated && pagination !== null) {
            const { page: paginationPage, last_page: lastPage } = pagination || {};
            if (
                paginationPage !== undefined &&
                lastPage !== undefined &&
                paginationPage < lastPage
            ) {
                setPage(paginationPage + 1);
            } else {
                setEndReached(true);
            }
        }
    }, [loading, paginated, pagination, setEndReached]);

    const finalOnChange = useCallback(
        (val: unknown) => {
            const newValue = isArray(val) && val.length === 0 ? null : val;
            if (onChange !== null) {
                onChange(newValue);
            }
        },
        [onChange],
    );

    // For direct search
    const hasSearch = useMemo(
        () => searchable && requestUrl !== null && itemSearchParam !== null,
        [searchable, requestUrl, itemSearchParam],
    );

    const loadOptions = useCallback(
        (searchValue: string) => {
            const searchParams =
                hasSearch && searchValue.length > 2
                    ? { [itemSearchParam!]: encodeURIComponent(searchValue) }
                    : null;
            return fetchOptions(requestUrl, searchParams);
        },
        [fetchOptions, hasSearch, requestUrl, itemSearchParam],
    );

    const getOptionValue = useCallback(
        (option: SelectOption) => {
            if (itemValuePath !== null) {
                return get(option, itemValuePath, null);
            }
            if (typeof option === 'object' && option !== null && 'value' in option) {
                return option.value;
            }
            return option;
        },
        [itemValuePath],
    );

    const getOptionLabel = useCallback(
        (option: SelectOption) => {
            if (itemLabelPath !== null) {
                return get(option, itemLabelPath, null);
            }
            if (typeof option === 'object' && option !== null && 'label' in option) {
                return option.label;
            }
            return option;
        },
        [itemLabelPath],
    );

    const finalHasSearch = hasSearch && loadOptions !== null;

    return (
        <Select
            autoSize={autoSize}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            isAsync={finalHasSearch}
            loadOptions={finalHasSearch ? loadOptions : undefined}
            defaultOptions={finalHasSearch}
            cacheOptions={finalHasSearch}
            {...props}
            searchable={searchable}
            onChange={finalOnChange}
            clearValue={clearValue}
            className={className}
            options={options || []}
            onMenuScrollToBottom={paginated ? onMenuScrollToBottom : undefined}
        />
    );
}

export default SelectFilter;
