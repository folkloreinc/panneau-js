/* eslint-disable react/no-array-index-key, react/button-has-type, react/jsx-props-no-spreading */
import classNames from 'classnames';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import Select from 'react-select';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { getSelectOptions } from '@panneau/core/utils';

const propTypes = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    options: PanneauPropTypes.selectOptions,
    disabled: PropTypes.bool,
    multiple: PropTypes.bool,
    searchable: PropTypes.bool,
    withoutReset: PropTypes.bool,
    noOptionsMessage: PropTypes.string,
    placeholder: PropTypes.string,
    autoSize: PropTypes.bool,
    className: PropTypes.string,
    selectClassName: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    value: null,
    options: [],
    disabled: false,
    multiple: false,
    searchable: true,
    withoutReset: false,
    noOptionsMessage: 'No results.',
    placeholder: 'Select...',
    autoSize: false,
    className: null,
    selectClassName: null,
    onChange: null,
};

const SelectElement = ({
    value,
    options,
    disabled,
    multiple,
    searchable,
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
                          opt.value !== null ? isEqual(val, opt.value) : false,
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

    return (
        <div className={classNames(['position-relative', className])}>
            <Select
                {...props}
                className={selectClassName !== null ? selectClassName : null}
                // menuPortalTarget={document.body}
                styles={{
                    container: () => ({ ...(autoSize ? { minWidth } : null), maxWidth: '100%' }),
                    menuPortal: (base) => ({ ...base, zIndex: 10 }),
                    placeholder: (base) => ({ ...base, whiteSpace: 'nowrap' }),
                    option: (base) => ({ ...base, color: '#343434' }),
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
