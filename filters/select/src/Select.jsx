/* eslint-disable react/jsx-props-no-spreading */
import { PropTypes as PanneauPropTypes } from '@panneau/core';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import Select from 'react-select';

const propTypes = {
    param: PropTypes.string,
    options: PanneauPropTypes.selectOptions,
    value: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    isMulti: PropTypes.bool,
    placeholder: PropTypes.string,
    noOptionsMessage: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
    disabled: PropTypes.bool,
};

const defaultProps = {
    param: 'q',
    options: [],
    placeholder: 'Select...',
    noOptionsMessage: 'No results.',
    isMulti: false,
    className: null,
    disabled: false,
};

const SelectFilter = ({
    param,
    value,
    options,
    isMulti,
    noOptionsMessage,
    placeholder,
    onChange,
    className,
    disabled,
}) => {
    const onChangeOption = useCallback((option) => {
        console.log({ param, option }); /* eslint-disable-line */
        onChange(option);
    });

    const minWidth = useMemo(
        () => options.reduce((width, { label }) => Math.max(width, label.length * 8 + 100), 100),
        [options],
    );

    return (
        <Select
            className={className}
            menuPortalTarget={document.body}
            styles={{
                container: () => ({ minWidth }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
            value={value || null}
            options={options}
            disabled={disabled}
            isMulti={isMulti}
            isClearable
            noOptionsMessage={() => noOptionsMessage}
            placeholder={placeholder}
            onChange={onChangeOption}
        />
    );
};

SelectFilter.propTypes = propTypes;
SelectFilter.defaultProps = defaultProps;

export default SelectFilter;
