import _extends from 'babel-runtime/helpers/extends';
import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isObject from 'lodash/isObject';
import isArray from 'lodash/isArray';
import Select, { Async } from 'react-select';

import FormGroup from '../FormGroup';

var valuePropTypes = PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.object]);

var propTypes = {
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
        label: PropTypes.string
    }),
    async: PropTypes.bool,
    multi: PropTypes.bool,
    searchable: PropTypes.bool,
    clearable: PropTypes.bool,
    style: PropTypes.object
};

var defaultProps = {
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
    style: null
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

var SelectField = function (_Component) {
    _inherits(SelectField, _Component);

    function SelectField(props) {
        _classCallCheck(this, SelectField);

        var _this = _possibleConstructorReturn(this, (SelectField.__proto__ || Object.getPrototypeOf(SelectField)).call(this, props));

        _this.onChange = _this.onChange.bind(_this);
        _this.getValueFromOption = _this.getValueFromOption.bind(_this);
        return _this;
    }

    _createClass(SelectField, [{
        key: 'onChange',
        value: function onChange(value) {
            var newValue = isArray(value) ? value.map(this.getValueFromOption) : this.getValueFromOption(value);
            if (this.props.onChange) {
                this.props.onChange(newValue);
            }
        }
    }, {
        key: 'getValueFromOption',
        value: function getValueFromOption(opt) {
            var getValueFromOption = this.props.getValueFromOption;

            if (getValueFromOption !== null) {
                return getValueFromOption(opt);
            }
            return isObject(opt) ? opt.value || null : opt;
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                name = _props.name,
                label = _props.label,
                value = _props.value,
                options = _props.options,
                canBeEmpty = _props.canBeEmpty,
                addEmptyOption = _props.addEmptyOption,
                emptyOption = _props.emptyOption,
                style = _props.style,
                async = _props.async,
                clearable = _props.clearable,
                other = _objectWithoutProperties(_props, ['name', 'label', 'value', 'options', 'canBeEmpty', 'addEmptyOption', 'emptyOption', 'style', 'async', 'clearable']);

            var selectOptions = [].concat(options);
            if (canBeEmpty && addEmptyOption) {
                selectOptions.push(emptyOption);
            }

            var shouldTakeFirstValue = !canBeEmpty && value === null && selectOptions.length > 0;
            var selectValue = shouldTakeFirstValue ? this.getValueFromOption(selectOptions[0]) : value;
            var selectClearable = clearable && shouldTakeFirstValue ? false : clearable;

            var asyncProps = !async ? {
                options: selectOptions
            } : null;

            var SelectComponent = async ? Async : Select;

            return React.createElement(
                FormGroup,
                _extends({}, other, {
                    className: 'form-group-select',
                    name: name,
                    label: label
                }),
                React.createElement(
                    'div',
                    { style: style },
                    React.createElement(SelectComponent, _extends({}, other, asyncProps, {
                        clearable: selectClearable,
                        name: 'form-field-select',
                        value: selectValue,
                        onChange: this.onChange
                    }))
                )
            );
        }
    }]);

    return SelectField;
}(Component);

SelectField.propTypes = propTypes;
SelectField.defaultProps = defaultProps;

export default SelectField;