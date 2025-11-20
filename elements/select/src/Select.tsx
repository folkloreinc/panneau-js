import classNames from 'classnames';
import isEqual from 'lodash-es/isEqual';
import isObject from 'lodash-es/isObject';
import uniqBy from 'lodash-es/uniqBy';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import AsyncCreatableSelect from 'react-select/async-creatable';
import CreatableSelect from 'react-select/creatable';

import type { Label } from '@panneau/core/types';

interface SelectOption {
    value?: any;
    label?: ReactNode;
}

interface SelectElementProps {
    value?: any;
    clearValue?: any;
    options?: SelectOption[] | Record<string, any>[];
    isAsync?: boolean;
    disabled?: boolean;
    multiple?: boolean;
    searchable?: boolean;
    creatable?: boolean;
    withoutReset?: boolean;
    noOptionsMessage?: Label;
    createPrefix?: string;
    onCreateOption?: ((value: string) => void) | null;
    placeholder?: Label;
    autoSize?: boolean;
    loadOptions?: ((searchValue: string) => Promise<SelectOption[]>) | null;
    getOptionValue?: ((option: SelectOption) => any) | null;
    getOptionLabel?: ((option: SelectOption) => ReactNode) | null;
    valueIsOption?: boolean;
    styles?: Record<string, any> | null;
    onChange?: ((value: any) => void) | null;
    className?: string | null;
    selectClassName?: string | null;
}

const DEFAULT_OPTIONS: SelectOption[] = [];

function SelectElement({
    value = null,
    clearValue = null,
    options = DEFAULT_OPTIONS,
    isAsync = false,
    disabled = false,
    multiple = false,
    searchable = true,
    creatable = false,
    withoutReset = false,
    noOptionsMessage = <FormattedMessage defaultMessage="No result" description="Default label" />,
    createPrefix = 'Create',
    onCreateOption = null,
    placeholder = (
        <FormattedMessage defaultMessage="Choose an option" description="Default label" />
    ),
    autoSize = false,
    getOptionValue = null,
    getOptionLabel = null,
    loadOptions = null,
    styles = null,
    onChange = null,
    className = null,
    selectClassName = null,
    valueIsOption = false,
    ...props
}: SelectElementProps) {
    const shouldConvertValue = !valueIsOption;
    const safeOptions = useMemo(
        () =>
            options !== null
                ? (options || [])
                      .map((it: any) => (!isObject(it) ? { value: it, label: it } : it))
                      .filter((it) => it !== null)
                : null,
        [options],
    );
    const [allOptions, setAllOptions] = useState(safeOptions || []);
    const addOptions = useCallback(
        (newOptions: SelectOption[]) =>
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
                ? (searchValue: string) =>
                      loadOptions(searchValue).then((newOptions) => {
                          addOptions(newOptions);
                          return newOptions;
                      })
                : loadOptions,
        [loadOptions, shouldConvertValue, addOptions],
    );

    useEffect(() => {
        if (shouldConvertValue) {
            addOptions(safeOptions || []);
        }
    }, [shouldConvertValue, safeOptions]);

    const onChangeOption = useCallback(
        (newValue: any) => {
            if (shouldConvertValue && newValue !== null) {
                addOptions(multiple ? newValue : [newValue]);
            }

            if (onChange === null) {
                return;
            }

            if (multiple && shouldConvertValue && newValue !== null) {
                onChange(
                    newValue.map((newValueItem: SelectOption) =>
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
        function findOption(val: any) {
            return (
                allOptions.find((opt) =>
                    isEqual(val, getOptionValue !== null ? getOptionValue(opt) : opt.value),
                ) || null
            );
        }
        return multiple
            ? (value || []).map(findOption).filter((it: any) => it !== null)
            : findOption(value);
    }, [value, allOptions, getOptionValue, multiple, shouldConvertValue]);

    const minWidth = useMemo(
        () =>
            (safeOptions || []).reduce(
                (width, { label = null }: any) =>
                    Math.max(width, (label !== null ? String(label).length : 0) * 8 + 100),
                100,
            ),
        [safeOptions],
    );

    let SelectComponent: any = Select;
    if (isAsync && creatable) {
        SelectComponent = AsyncCreatableSelect;
    } else if (isAsync) {
        SelectComponent = AsyncSelect;
    } else if (creatable) {
        SelectComponent = CreatableSelect;
    }

    return (
        <div className={classNames(['position-relative', { [className!]: className !== null }])}>
            <SelectComponent
                {...props}
                {...(getOptionValue !== null ? { getOptionValue } : {})}
                {...(getOptionLabel !== null ? { getOptionLabel } : {})}
                {...(creatable
                    ? {
                          onCreateOption,
                          formatCreateLabel: (newLabel: string) =>
                              `${createPrefix || 'Create'} ${newLabel}`,
                      }
                    : {})}
                {...(safeOptions !== null ? { options: safeOptions } : {})}
                {...(finalLoadOptions !== null ? { loadOptions: finalLoadOptions } : {})}
                className={selectClassName !== null ? selectClassName : undefined}
                styles={{
                    container: (base: any) => ({
                        ...base,
                        ...(autoSize ? { minWidth } : {}),
                        maxWidth: '100%',
                    }),
                    menuPortal: (base: any) => ({ ...base, zIndex: 10 }),
                    placeholder: (base: any) => ({
                        ...base,
                        whiteSpace: 'normal',
                        ...(autoSize ? { whiteSpace: 'nowrap' } : {}),
                    }),
                    singleValue: (base: any) => ({
                        ...base,
                        color: 'var(--bs-body-color)',
                    }),
                    multiValueRemove: (base: any, { isDisabled }: any) => ({
                        ...base,
                        color: 'var(--bs-dark)',
                        ...(isDisabled
                            ? {
                                  visibility: 'hidden',
                                  width: '0',
                                  paddingLeft: '0',
                              }
                            : {}),
                    }),
                    input: (base: any, { isDisabled }: any) => ({
                        ...base,
                        color: 'var(--bs-body-color)',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                    }),
                    control: (base: any, { isDisabled, isFocused }: any) => ({
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
                    indicators: (base: any) => ({
                        ...base,
                        color: 'var(--bs-body-bg)',
                        backgroundColor: 'var(--bs-body-color)',
                    }),
                    menu: (base: any) => ({
                        ...base,
                        backgroundColor: 'var(--bs-body-color)',
                        zIndex: 1001,
                    }),
                    menuList: (base: any) => ({
                        ...base,
                        backgroundColor: 'var(--bs-body-bg)',
                        border: '1px solid var(--bs-border-color)',
                        borderRadius: '4px',
                    }),
                    option: (base: any, { isDisabled }: any) => ({
                        ...base,
                        color: 'var(--bs-body-color)',
                        backgroundColor: 'var(--bs-body-bg)',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        ':active': {
                            ...(base as any)[':active'],
                            color: 'var(--bs-primary)',
                            cursor: 'pointer',
                        },
                    }),
                    dropdownIndicator: (base: any) => ({
                        ...base,
                        color: 'inherit',
                    }),
                    ...(styles !== null ? styles : {}),
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
}

export default SelectElement;
