/* eslint-disable react/jsx-props-no-spreading */
import { getCSRFHeaders, getJSON } from '@folklore/fetch';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { getPathValue } from '@panneau/core/utils';
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
    getOptionLabel: PropTypes.func,
    getOptionValue: PropTypes.func,
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
    getOptionLabel: null,
    getOptionValue: null,
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
    getOptionLabel: customGetOptionLabel,
    getOptionValue: customGetOptionValue,
    multiple,
    className,
    onChange,
    onInputChange: customOnInputChange,
    ...props
}) => {
    const getOptionLabel = useMemo(
        () =>
            customGetOptionLabel ||
            (optionLabelPath !== null ? (option) => getPathValue(option, optionLabelPath) : null),
        [customGetOptionLabel, optionLabelPath],
    );
    const getOptionValue = useMemo(
        () =>
            customGetOptionValue ||
            (optionValuePath !== null ? (option) => getPathValue(option, optionValuePath) : null),
        [customGetOptionValue, optionValuePath],
    );

    const [inputTextValue, setInputTextValue] = useState('');
    const inputRef = useRef(false);

    const loadOptions = useMemo(
        () =>
            requestUrl !== null
                ? (requestValue) => {
                      const queryData = {
                          paginated,
                          ...(paginated ? { page: 1 } : null),
                          ...requestQuery,
                          ...(requestValue !== null && requestSearchParamName !== null
                              ? { [requestSearchParamName]: requestValue }
                              : null),
                      };
                      const finalQuery =
                          queryData !== null
                              ? queryString.stringify(queryData, { arrayFormat: 'bracket' })
                              : null;

                      return getJSON(
                          `${requestUrl}${
                              finalQuery !== null && finalQuery.length > 0 ? `?${finalQuery}` : ''
                          }`,
                          {
                              credentials: 'include',
                              headers: getCSRFHeaders(),
                              ...requestOptions,
                          },
                      )
                          .then((newItems) => {
                              const { data = null } = paginated
                                  ? newItems || {}
                                  : { data: newItems || [] };
                              const finalNewItems =
                                  maxOptionsCount !== null ? data.slice(0, maxOptionsCount) : data;
                              inputRef.current = false;
                              return prepareRequestOptions !== null
                                  ? prepareRequestOptions(finalNewItems)
                                  : finalNewItems;
                          })
                          .catch(() => {
                              inputRef.current = false;
                          });
                  }
                : null,
        [
            maxOptionsCount,
            requestUrl,
            requestQuery,
            requestOptions,
            requestSearchParamName,
            prepareRequestOptions,
            paginated,
        ],
    );

    const finalLoadOptions = customLoadOptions || loadOptions || null;

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
        [setInputTextValue, customOnInputChange],
    );

    return (
        <Select
            className={className}
            isAsync={finalLoadOptions !== null}
            defaultOptions={finalLoadOptions !== null}
            loadOptions={finalLoadOptions}
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
