/* eslint-disable formatjs/enforce-default-message, react/no-array-index-key, react/button-has-type, react/jsx-props-no-spreading */
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import isObject from 'lodash/isObject';
import uniqBy from 'lodash/uniqBy';
// import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import AsyncCreatableSelect from 'react-select/async-creatable';
import CreatableSelect from 'react-select/creatable';

import { PropTypes as PanneauPropTypes } from '@panneau/core';

const propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.any,
    // eslint-disable-next-line react/forbid-prop-types
    clearValue: PropTypes.any,
    options: PanneauPropTypes.selectOptions,
    isAsync: PropTypes.bool,
    disabled: PropTypes.bool,
    multiple: PropTypes.bool,
    searchable: PropTypes.bool,
    creatable: PropTypes.bool,
    withoutReset: PropTypes.bool,
    noOptionsMessage: PanneauPropTypes.label,
    createPrefix: PropTypes.string,
    onCreateOption: PropTypes.func,
    placeholder: PanneauPropTypes.label,
    autoSize: PropTypes.bool,
    loadOptions: PropTypes.func,
    getOptionValue: PropTypes.func,
    getOptionLabel: PropTypes.func,
    valueIsOption: PropTypes.bool,
    styles: PropTypes.shape({}),
    onChange: PropTypes.func,
    className: PropTypes.string,
    selectClassName: PropTypes.string,
};

const defaultProps = {
    value: null,
    clearValue: null,
    options: [],
    isAsync: false,
    disabled: false,
    multiple: false,
    searchable: true,
    creatable: false,
    withoutReset: false,
    noOptionsMessage: <FormattedMessage defaultMessage="No result" description="Default label" />,
    createPrefix: 'Create',
    onCreateOption: null,
    placeholder: <FormattedMessage defaultMessage="Choose an option" description="Default label" />,
    autoSize: false,
    getOptionValue: null,
    getOptionLabel: null,
    loadOptions: null,
    valueIsOption: false,
    styles: null,
    onChange: null,
    className: null,
    selectClassName: null,
};

const SelectElement = ({
    value,
    clearValue,
    options,
    isAsync,
    disabled,
    multiple,
    searchable,
    creatable,
    withoutReset,
    noOptionsMessage,
    createPrefix,
    onCreateOption,
    placeholder,
    autoSize,
    getOptionValue,
    getOptionLabel,
    loadOptions,
    styles,
    onChange,
    className,
    selectClassName,
    valueIsOption,
    ...props
}) => {
    const shouldConvertValue = !valueIsOption;
    const safeOptions = useMemo(
        () =>
            options !== null
                ? (options || [])
                      .map((it) => (!isObject(it) ? { value: it, label: it } : it))
                      .filter((it) => it !== null)
                : null,
        [options],
    );
    const [allOptions, setAllOptions] = useState(safeOptions || []);
    const addOptions = useCallback(
        (newOptions) =>
            setAllOptions(
                uniqBy([...allOptions, ...newOptions], (option) =>
                    getOptionValue !== null ? getOptionValue(option) : option.value,
                ),
            ),
        [allOptions, getOptionValue],
    );
    const finalLoadOptions = useMemo(
        () =>
            loadOptions !== null && shouldConvertValue
                ? (searchValue) =>
                      loadOptions(searchValue).then((newOptions) => {
                          addOptions(newOptions);
                          return newOptions;
                      })
                : loadOptions,
        [loadOptions, shouldConvertValue, addOptions],
    );

    useEffect(() => {
        if (shouldConvertValue) {
            addOptions(safeOptions);
        }
    }, [shouldConvertValue, safeOptions]);

    const onChangeOption = useCallback(
        (newValue) => {
            if (shouldConvertValue && newValue !== null) {
                addOptions(multiple ? newValue : [newValue]);
            }

            if (onChange === null) {
                return;
            }

            if (multiple && shouldConvertValue && newValue !== null) {
                onChange(
                    newValue.map((newValueItem) =>
                        getOptionValue !== null ? getOptionValue(newValueItem) : newValueItem.value,
                    ),
                );
            } else if (shouldConvertValue && newValue !== null) {
                onChange(getOptionValue !== null ? getOptionValue(newValue) : newValue.value);
            } else {
                onChange(newValue);
            }
        },
        [onChange, multiple, shouldConvertValue, getOptionValue, addOptions],
    );

    const finalValue = useMemo(() => {
        if (!shouldConvertValue || value === null) {
            return value;
        }
        function findOption(val) {
            return (
                allOptions.find((opt) =>
                    isEqual(val, getOptionValue !== null ? getOptionValue(opt) : opt.value),
                ) || null
            );
        }
        return multiple
            ? (value || []).map(findOption).filter((it) => it !== null)
            : findOption(value);
    }, [value, allOptions, getOptionValue, multiple]);

    const minWidth = useMemo(
        () =>
            (safeOptions || []).reduce(
                (width, { label = null }) =>
                    Math.max(width, (label !== null ? label.length : 0) * 8 + 100),
                100,
            ),
        [safeOptions],
    );

    let SelectComponent = Select;
    if (isAsync && creatable) {
        SelectComponent = AsyncCreatableSelect;
    } else if (isAsync) {
        SelectComponent = AsyncSelect;
    } else if (creatable) {
        SelectComponent = CreatableSelect;
    }

    // console.log('select', isAsync, creatable, SelectComponent, onCreateOption);

    return (
        <div className={classNames(['position-relative', { [className]: className !== null }])}>
            <SelectComponent
                {...props}
                {...(getOptionValue !== null ? { getOptionValue } : null)}
                {...(getOptionLabel !== null ? { getOptionLabel } : null)}
                {...(creatable
                    ? {
                          onCreateOption,
                          formatCreateLabel: (newLabel) =>
                              `${createPrefix || 'Create'} ${newLabel}`,
                      }
                    : null)}
                {...(safeOptions !== null ? { options: safeOptions } : null)}
                {...(finalLoadOptions !== null ? { loadOptions: finalLoadOptions } : null)}
                className={selectClassName !== null ? selectClassName : null}
                // menuPortalTarget={document.body}
                styles={{
                    container: (base) => ({
                        ...base,
                        ...(autoSize ? { minWidth } : null),
                        maxWidth: '100%',
                        // ':focus': {
                        //     ...base[':focus'],
                        //     border: '2px solid black',
                        // },
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 10 }),
                    placeholder: (base) => ({
                        ...base,
                        whiteSpace: 'normal',
                        ...(autoSize ? { whiteSpace: 'nowrap' } : null),
                    }),
                    singleValue: (base) => ({
                        ...base,
                        color: 'var(--bs-body-color)',
                    }),
                    multiValueRemove: (base, { isDisabled }) => ({
                        ...base,
                        color: 'var(--bs-dark)',
                        ...(
                            isDisabled ? {
                                visibility: 'hidden',
                                width: '0'
                            } : {}
                        ),
                    }),
                    input: (base, { isDisabled }) => ({
                        ...base,
                        color: 'var(--bs-body-color)',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                    }),
                    control: (base, { isDisabled, isFocused }) => ({
                        ...base,
                        color: 'var(--bs-body-color)',
                        backgroundColor: 'var(--bs-input-color)',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        borderColor: isFocused
                            ? 'rgba(var(--bs-primary-rgb), 0.25)'
                            : 'hsl(0, 0%, 80%)',
                        boxShadow: isFocused
                            ? '0 0 0 1px rgba(var(--bs-primary-rgb), 0.25)'
                            : 'none',
                        '&:hover': {
                            borderColor: 'rgba(var(--bs-primary-rgb), 0.25)',
                            boxShadow: '0 0 0 1px rgba(var(--bs-primary-rgb, 0.25)',
                        },
                    }),
                    indicators: (base) => ({
                        ...base,
                        color: 'var(--bs-body-bg)',
                        backgroundColor: 'var(--bs-body-color)',
                    }),
                    menu: (base) => ({
                        ...base,
                        backgroundColor: 'var(--bs-body-color)',
                        zIndex: 1001,
                    }),
                    menuList: (base) => ({
                        ...base,
                        backgroundColor: 'var(--bs-body-bg)',
                        border: '1px solid var(--bs-border-color)',
                        borderRadius: '4px',
                    }),
                    option: (base, { isDisabled }) => ({
                        ...base,
                        color: 'var(--bs-body-color)',
                        backgroundColor: 'var(--bs-body-bg)',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        ':active': {
                            ...base[':active'],
                            color: 'var(--bs-primary)',
                            cursor: 'pointer',
                        },
                    }),
                    dropdownIndicator: (base) => ({
                        ...base,
                        color: 'inherit',
                    }),
                    ...(styles !== null ? styles : null),
                }}
                value={finalValue || null}
                isDisabled={disabled}
                isMulti={multiple}
                isClearable={!withoutReset}
                clearValue={clearValue}
                isSearchable={searchable}
                noOptionsMessage={() => noOptionsMessage}
                placeholder={placeholder}
                onChange={onChangeOption}
            />
        </div>
    );
};

SelectElement.propTypes = propTypes;
SelectElement.defaultProps = defaultProps;

export default SelectElement;
