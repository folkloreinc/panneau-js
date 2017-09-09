import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isObject from 'lodash/isObject';
import Select, { Async, AsyncCreatable, Creatable } from 'react-select';
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
    options: PropTypes.arrayOf(PropTypes.oneOf([
        PropTypes.string,
        PropTypes.shape({
            value: PropTypes.any,
            label: PropTypes.string,
        }),
    ])),
    getValueFromOption: PropTypes.func,
    onChange: PropTypes.func,
    onOptionsChange: PropTypes.func,

    placeholder: PropTypes.string,
    noResultsText: PropTypes.string,
    canBeEmpty: PropTypes.bool,
    addEmptyOption: PropTypes.bool,
    emptyOption: PropTypes.shape({
        value: valuePropTypes,
        label: PropTypes.string,
    }),
    loadOptions: PropTypes.func,
    fetchOptions: PropTypes.func,
    async: PropTypes.bool,
    multiple: PropTypes.bool,
    searchable: PropTypes.bool,
    clearable: PropTypes.bool,
    creatable: PropTypes.bool,
    style: PropTypes.object, // eslint-disable-line
};

const defaultProps = {
    name: null,
    label: '',
    value: null,
    options: [],
    onChange: null,
    onOptionsChange: null,

    getValueFromOption: null,
    canBeEmpty: true,
    searchable: true,
    clearable: true,
    creatable: false,
    async: false,
    multiple: false,
    loadOptions: null,
    fetchOptions: null,
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
        this.onNewOptionClick = this.onNewOptionClick.bind(this);
        this.getValueFromOption = this.getValueFromOption.bind(this);

        this.state = {
            options: props.options,
        };
    }

    componentWillReceiveProps(nextProps) {
        const optionsChanged = this.props.options !== nextProps.options;
        if (optionsChanged) {
            this.setState({
                options: nextProps.options,
            });
        }
    }

    onNewOptionClick(option) {
        const { options } = this.state;
        this.setState({
            options: [
                ...options,
                option,
            ],
        }, () => {
            if (this.props.onOptionsChange) {
                this.props.onOptionsChange(this.state.options);
            }
        });
    }

    onChange(value) {
        const { multiple, clearable } = this.props;
        let newValue;
        if (multiple && value === null) {
            newValue = null;
        } else if (multiple && value.length === 0 && clearable) {
            newValue = null;
        } else if (multiple) {
            newValue = value.map(this.getValueFromOption);
        } else {
            newValue = this.getValueFromOption(value);
        }
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

    loadOptions(input, callback) {
        const { loadOptions, fetchOptions } = this.props;
        if (loadOptions !== null) {
            return loadOptions(input, callback);
        } else if (fetchOptions !== null) {
            return fetchOptions(input).then(options => ({
                options,
            }));
        }
        return null;
    }

    render() {
        const {
            name,
            label,
            value,
            canBeEmpty,
            addEmptyOption,
            emptyOption,
            style,
            async,
            creatable,
            multiple,
            clearable,
            ...other
        } = this.props;

        const {
            options,
        } = this.state;

        const selectOptions = [].concat(options);
        if (canBeEmpty && addEmptyOption) {
            selectOptions.unshift(emptyOption);
        }

        const shouldTakeFirstValue = !canBeEmpty && value === null && selectOptions.length > 0;
        const selectValue = shouldTakeFirstValue ?
            this.getValueFromOption(selectOptions[0]) : value;
        const selectClearable = clearable && shouldTakeFirstValue ? false : clearable;

        const asyncProps = async ? {
            loadOptions: this.loadOptions,
        } : {
            options: selectOptions,
        };

        let SelectComponent;
        if (async && creatable) {
            SelectComponent = AsyncCreatable;
        } else if (async) {
            SelectComponent = Async;
        } else if (creatable) {
            SelectComponent = Creatable;
        } else {
            SelectComponent = Select;
        }

        return (
            <FormGroup
                {...other}
                className="form-group-select"
                name={name}
                label={label}
            >
                <div style={style}>
                    <SelectComponent
                        name="form-field-select"
                        multi={multiple}
                        {...other}
                        {...asyncProps}
                        clearable={selectClearable}
                        value={selectValue}
                        onChange={this.onChange}
                        onNewOptionClick={this.onNewOptionClick}
                    />
                </div>
            </FormGroup>
        );
    }
}

SelectField.propTypes = propTypes;
SelectField.defaultProps = defaultProps;

export default SelectField;
