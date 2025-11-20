import { getCSRFHeaders, getJSON } from '@folklore/fetch';
import queryString from 'query-string';
import { useCallback, useMemo, useRef, useState } from 'react';

import { getPathValue } from '@panneau/core/utils';
import Select from '@panneau/element-select';

interface SelectFieldProps {
    value?: unknown;
    paginated?: boolean;
    loadOptions?: ((searchValue: string | null) => Promise<unknown[]>) | null;
    requestUrl?: string | null;
    requestOptions?: Record<string, unknown> | null;
    requestQuery?: Record<string, unknown> | null;
    requestSearchParamName?: string | null;
    prepareRequestOptions?: ((items: unknown[]) => unknown[]) | null;
    maxOptionsCount?: number | null;
    optionLabelPath?: string | null;
    optionValuePath?: string | null;
    getOptionLabel?: ((option: unknown) => string) | null;
    getOptionValue?: ((option: unknown) => string | number) | null;
    multiple?: boolean;
    className?: string | null;
    onChange?: ((value: unknown) => void) | null;
    onInputChange?: ((value: string) => void) | null;
    [key: string]: unknown;
}

function SelectField({
    value = null,
    paginated = false,
    loadOptions: customLoadOptions = null,
    requestUrl = null,
    requestQuery = null,
    requestOptions = null,
    requestSearchParamName = 'search',
    prepareRequestOptions = null,
    maxOptionsCount = null,
    optionLabelPath = null,
    optionValuePath = null,
    getOptionLabel: customGetOptionLabel = null,
    getOptionValue: customGetOptionValue = null,
    multiple = false,
    className = null,
    onChange = null,
    onInputChange: customOnInputChange = null,
    ...props
}: SelectFieldProps) {
    const getOptionLabel = useMemo(
        () =>
            customGetOptionLabel ||
            (optionLabelPath !== null
                ? (option: unknown) => getPathValue(option, optionLabelPath)
                : null),
        [customGetOptionLabel, optionLabelPath],
    );
    const getOptionValue = useMemo(
        () =>
            customGetOptionValue ||
            (optionValuePath !== null
                ? (option: unknown) => getPathValue(option, optionValuePath)
                : null),
        [customGetOptionValue, optionValuePath],
    );

    const [inputTextValue, setInputTextValue] = useState('');
    const inputRef = useRef(false);

    const loadOptions = useMemo(
        () =>
            requestUrl !== null
                ? (requestValue: string | null) => {
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
                          .then((newItems: any) => {
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
        (newValue: unknown) => {
            if (onChange !== null) {
                onChange(newValue);
            }
            setInputTextValue('');
        },
        [onChange, setInputTextValue],
    );

    const onInputChange = useCallback(
        (textValue: string) => {
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
            value={value}
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
}

export default SelectField;
