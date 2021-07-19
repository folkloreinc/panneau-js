/* eslint-disable react/jsx-props-no-spreading */
// import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { useApi } from '@panneau/data';
import Select from '@panneau/element-select';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

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
    itemValuePath,
    itemLabelPath,
    maxItemsCount,
    className,
    ...props
}) => {
    const api = useApi();
    const [options, setOptions] = useState(initialOptions || []);

    const fetchOptions = useCallback(
        (url) => {
            if (url !== null && api !== null) {
                api.requestGet(
                    url,
                    {
                        paginate: false,
                        ...requestQuery,
                    },
                    requestOptions,
                )
                    .then((newItems) => {
                        const finalItems =
                            maxItemsCount !== null ? newItems.slice(0, maxItemsCount) : newItems;
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
            itemLabelPath,
            itemValuePath,
        ],
    );

    useEffect(() => {
        fetchOptions(requestUrl);
    }, [requestUrl]);

    return <Select {...props} className={className} options={options} />;
};

SelectFilter.propTypes = propTypes;
SelectFilter.defaultProps = defaultProps;

export default SelectFilter;
