import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import Select, { Async } from 'react-select';
import '../styles/vendor.global.scss';
import FormGroup from '../FormGroup';

const valuePropTypes = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array,
    PropTypes.object,
]);

const propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    value: valuePropTypes,
    options: PropTypes.array,
    getValueFromOption: PropTypes.func,
    onChange: PropTypes.func,

    placeholder: PropTypes.string,
    noResultsText: PropTypes.string,
    canBeEmpty: PropTypes.bool,
    addEmptyOption: PropTypes.bool,
    emptyOption: PropTypes.shape({
        value: valuePropTypes,
        label: PropTypes.string,
    }),
    async: PropTypes.bool,
    multi: PropTypes.bool,
    searchable: PropTypes.bool,
    clearable: PropTypes.bool,
    style: PropTypes.object,
};

const defaultProps = {
    name: null,
    label: '',
    value: null,
    options: [],
    onChange: null,

    getValueFromOption: null,
    canBeEmpty: true,
    searchable: true,
    clearable: true,
    async: false,
    multi: false,
    placeholder: 'Aucun',
    noResultsText: 'Aucun résultat',
    addEmptyOption: false,
    emptyOption: { value: '', label: '--' },
    style: null,
};

/**
 *  Class: SelectField
 *  Makes a select using react-select
 *
 *  Options are using the format [{ label: "", value: "" }]
 *
 *  Note: value is array if multiple select is allowed
 *  @param {string,number,array,object} value
 *  @return {string,array} newValue
 */

class SelectField extends Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.getValueFromOption = this.getValueFromOption.bind(this);
    }

    onChange(value) {
        const newValue = isArray(value) ?
            value.map(this.getValueFromOption) : this.getValueFromOption(value);
        if (this.props.onChange) {
            this.props.onChange(newValue);
        }
    }

    getValueFromOption(opt) {
        const { getValueFromOption } = this.props;
        if (getValueFromOption !== null) {
            return getValueFromOption(opt);
        }
        return isObject(opt) && typeof opt.value !== 'undefined' ? opt.value : opt;
    }

    render() {
        const {
            name,
            label,
            value,
            options,
            canBeEmpty,
            addEmptyOption,
            emptyOption,
            style,
            async,
            clearable,
            ...other
        } = this.props;

        const selectOptions = [].concat(options);
        if (canBeEmpty && addEmptyOption) {
            selectOptions.unshift(emptyOption);
        }

        const shouldTakeFirstValue = !canBeEmpty && value === null && selectOptions.length > 0;
        const selectValue = shouldTakeFirstValue ?
            this.getValueFromOption(selectOptions[0]) : value;
        const selectClearable = clearable && shouldTakeFirstValue ? false : clearable;

        const asyncProps = !async ? {
            options: selectOptions,
        } : null;

        const SelectComponent = async ? Async : Select;

        return (
            <FormGroup
                {...other}
                className="form-group-select"
                name={name}
                label={label}
            >
                <div style={style}>
                    <SelectComponent
                        {...other}
                        {...asyncProps}
                        clearable={selectClearable}
                        name="form-field-select"
                        value={selectValue}
                        onChange={this.onChange}
                    />
                </div>
            </FormGroup>
        );
    }
}

SelectField.propTypes = propTypes;
SelectField.defaultProps = defaultProps;

export default SelectField;
