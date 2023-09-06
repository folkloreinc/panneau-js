/* eslint-disable react/no-array-index-key, react/button-has-type, react/jsx-props-no-spreading */
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import isObject from 'lodash/isObject';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import CreatableSelect from 'react-select/creatable';
import AsyncCreatableSelect from 'react-select/async-creatable';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getSelectOptions } from '@panneau/core/utils';

const propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    options: PanneauPropTypes.selectOptions,
    isAsync: PropTypes.bool,
    disabled: PropTypes.bool,
    multiple: PropTypes.bool,
    searchable: PropTypes.bool,
    creatable: PropTypes.bool,
    withoutReset: PropTypes.bool,
    noOptionsMessage: PanneauPropTypes.label,
    placeholder: PanneauPropTypes.label,
    autoSize: PropTypes.bool,
    className: PropTypes.string,
    selectClassName: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    value: null,
    options: [],
    isAsync: false,
    disabled: false,
    multiple: false,
    searchable: true,
    creatable: false,
    withoutReset: false,
    noOptionsMessage: <FormattedMessage defaultMessage="No result" description="Default label" />,
    placeholder: <FormattedMessage defaultMessage="Choose an option" description="Default label" />,
    autoSize: false,
    className: null,
    selectClassName: null,
    onChange: null,
};

const SelectElement = ({
    value,
    options,
    isAsync,
    disabled,
    multiple,
    searchable,
    creatable,
    withoutReset,
    noOptionsMessage,
    placeholder,
    autoSize,
    className,
    selectClassName,
    onChange,
    ...props
}) => {
    const finalOptions = useMemo(() => getSelectOptions(options), [options]);

    const onChangeOption = useCallback(
        (newValue) => {
            if (onChange !== null) {
                if (multiple) {
                    onChange(newValue !== null ? newValue.map(({ value: val }) => val) : null);
                } else {
                    onChange(newValue !== null && newValue.value ? newValue.value : null);
                }
            }
        },
        [onChange, multiple],
    );

    const optionValue = useMemo(() => {
        if (multiple) {
            return value !== null
                ? value.map((val) =>
                      finalOptions.find((opt) =>
                          // eslint-disable-next-line no-nested-ternary
                          opt.value !== null
                              ? isObject(val) && val.value
                                  ? isEqual(val.value, opt.value)
                                  : isEqual(val, opt.value)
                              : false,
                      ),
                  )
                : [];
        }
        return finalOptions.find((opt) => (opt.value !== null ? isEqual(value, opt.value) : false));
    }, [value, options, multiple]);

    const minWidth = useMemo(
        () =>
            finalOptions.reduce(
                (width, { label = null }) =>
                    Math.max(width, (label !== null ? label.length : 0) * 8 + 100),
                100,
            ),
        [finalOptions],
    );

    let SelectComponent = Select;
    if (isAsync && creatable) {
        SelectComponent = AsyncCreatableSelect;
    } else if (isAsync) {
        SelectComponent = AsyncSelect;
    } else if (creatable) {
        SelectComponent = CreatableSelect;
    }

    return (
        <div className={classNames(['position-relative', className])}>
            <SelectComponent
                {...props}
                className={selectClassName !== null ? selectClassName : null}
                // menuPortalTarget={document.body}
                styles={{
                    container: () => ({ ...(autoSize ? { minWidth } : null), maxWidth: '100%' }),
                    menuPortal: (base) => ({ ...base, zIndex: 10 }),
                    placeholder: (base) => ({ ...base, whiteSpace: 'nowrap' }),
                    // TODO: fix dark or themed mode
                    // option: (base) => ({ ...base, color: '#343434' }),
                }}
                value={optionValue || null}
                options={finalOptions}
                isDisabled={disabled}
                isMulti={multiple}
                isClearable={!withoutReset}
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
