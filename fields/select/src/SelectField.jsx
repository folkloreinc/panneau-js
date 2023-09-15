/* eslint-disable react/jsx-props-no-spreading */
// import { PropTypes as PanneauPropTypes } from '@panneau/core';
import isObject from 'lodash/isObject';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';

import { getPathValue } from '@panneau/core/utils';
import { useApi } from '@panneau/data';
import Select from '@panneau/element-select';

const propTypes = {
    paginated: PropTypes.bool,
    loadOptions: PropTypes.func,
    requestUrl: PropTypes.string,
    requestOptions: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    requestQuery: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    requestSearchParamName: PropTypes.string,
    prepareRequestOptions: PropTypes.func,
    maxOptionsCount: PropTypes.number,
    optionLabelPath: PropTypes.string,
    optionValuePath: PropTypes.string,
    multiple: PropTypes.bool,
    className: PropTypes.string,
    onChange: PropTypes.func,
    onInputChange: PropTypes.func,
};

const defaultProps = {
    paginated: false,
    loadOptions: null,
    requestUrl: null,
    requestOptions: null,
    requestQuery: null,
    requestSearchParamName: 'search',
    prepareRequestOptions: null,
    maxOptionsCount: null,
    optionLabelPath: null,
    optionValuePath: null,
    multiple: false,
    className: null,
    onChange: null,
    onInputChange: null,
};

const SelectField = ({
    paginated,
    loadOptions: customLoadOptions,
    requestUrl,
    requestQuery,
    requestOptions,
    requestSearchParamName,
    prepareRequestOptions,
    maxOptionsCount,
    optionLabelPath,
    optionValuePath,
    multiple,
    className,
    onChange,
    onInputChange: customOnInputChange,
    ...props
}) => {
    const api = useApi();
    const isAsync = requestUrl !== null || customLoadOptions !== null;
    const [inputTextValue, setInputTextValue] = useState('');
    const loadOptions = useCallback(
        (requestValue) =>
            api
                .requestGet(
                    requestUrl,
                    {
                        paginated,
                        ...requestQuery,
                        ...(requestValue !== null
                            ? { [requestSearchParamName]: requestValue }
                            : null),
                    },
                    requestOptions,
                )
                .then((newItems) => {
                    const { data = null } = paginated ? newItems : { data: newItems };
                    const finalNewItems =
                        maxOptionsCount !== null ? data.slice(0, maxOptionsCount) : data;
                    return prepareRequestOptions !== null
                        ? prepareRequestOptions(finalNewItems)
                        : finalNewItems;
                }),
        [
            api,
            maxOptionsCount,
            inputTextValue,
            requestUrl,
            requestQuery,
            requestOptions,
            requestSearchParamName,
            prepareRequestOptions,
            paginated,
        ],
    );

    const onValueChange = useCallback(
        (newValue) => {
            if (onChange !== null) {
                onChange(newValue);
            }

            setInputTextValue('');
        },
        [onChange, setInputTextValue],
    );

    const onInputChange = useCallback(
        (textValue) => {
            setInputTextValue(textValue);
            if (customOnInputChange !== null) {
                customOnInputChange(textValue);
            }
        },
        [paginated, requestQuery, setInputTextValue],
    );

    const getOptionLabel = useMemo(
        () => (optionLabelPath !== null ? (option) => getPathValue(option, optionLabelPath) : null),
        [optionLabelPath],
    );
    const getOptionValue = useMemo(
        () => (optionValuePath !== null ? (option) => getPathValue(option, optionValuePath) : null),
        [optionValuePath],
    );

    return (
        <Select
            className={className}
            isAsync={isAsync}
            loadOptions={isAsync ? customLoadOptions || loadOptions : null}
            defaultOptions={isAsync}
            onChange={onValueChange}
            onInputChange={onInputChange}
            inputValue={inputTextValue}
            multiple={multiple}
            {...(getOptionLabel !== null ? { getOptionLabel } : null)}
            {...(getOptionValue !== null ? { getOptionValue } : null)}
            {...props}
        />
    );
};

SelectField.propTypes = propTypes;
SelectField.defaultProps = defaultProps;

export default SelectField;
