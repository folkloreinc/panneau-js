import _extends from 'babel-runtime/helpers/extends';
import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';
import _toConsumableArray from 'babel-runtime/helpers/toConsumableArray';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isObject from 'lodash/isObject';
import Select, { Async, AsyncCreatable, Creatable } from 'react-select';

import FormGroup from '../FormGroup';

var valuePropTypes = PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.array, PropTypes.object]);

var propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    value: valuePropTypes,
    options: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.shape({
        value: PropTypes.any,
        label: PropTypes.string
    })])),
    getValueFromOption: PropTypes.func,
    onChange: PropTypes.func,
    onOptionsChange: PropTypes.func,

    placeholder: PropTypes.string,
    noResultsText: PropTypes.string,
    canBeEmpty: PropTypes.bool,
    addEmptyOption: PropTypes.bool,
    emptyOption: PropTypes.shape({
        value: valuePropTypes,
        label: PropTypes.string
    }),
    loadOptions: PropTypes.func,
    fetchOptions: PropTypes.func,
    async: PropTypes.bool,
    multiple: PropTypes.bool,
    searchable: PropTypes.bool,
    clearable: PropTypes.bool,
    creatable: PropTypes.bool,
    style: PropTypes.object // eslint-disable-line
};

var defaultProps = {
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
        _this.onNewOptionClick = _this.onNewOptionClick.bind(_this);
        _this.getValueFromOption = _this.getValueFromOption.bind(_this);

        _this.state = {
            options: props.options
        };
        return _this;
    }

    _createClass(SelectField, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            var optionsChanged = this.props.options !== nextProps.options;
            if (optionsChanged) {
                this.setState({
                    options: nextProps.options
                });
            }
        }
    }, {
        key: 'onNewOptionClick',
        value: function onNewOptionClick(option) {
            var _this2 = this;

            var options = this.state.options;

            this.setState({
                options: [].concat(_toConsumableArray(options), [option])
            }, function () {
                if (_this2.props.onOptionsChange) {
                    _this2.props.onOptionsChange(_this2.state.options);
                }
            });
        }
    }, {
        key: 'onChange',
        value: function onChange(value) {
            var _props = this.props,
                multiple = _props.multiple,
                clearable = _props.clearable;

            var newValue = void 0;
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
    }, {
        key: 'getValueFromOption',
        value: function getValueFromOption(opt) {
            var getValueFromOption = this.props.getValueFromOption;

            if (getValueFromOption !== null) {
                return getValueFromOption(opt);
            }
            return isObject(opt) && typeof opt.value !== 'undefined' ? opt.value : opt;
        }
    }, {
        key: 'loadOptions',
        value: function loadOptions(input, callback) {
            var _props2 = this.props,
                loadOptions = _props2.loadOptions,
                fetchOptions = _props2.fetchOptions;

            if (loadOptions !== null) {
                return loadOptions(input, callback);
            } else if (fetchOptions !== null) {
                return fetchOptions(input).then(function (options) {
                    return {
                        options: options
                    };
                });
            }
            return null;
        }
    }, {
        key: 'render',
        value: function render() {
            var _props3 = this.props,
                name = _props3.name,
                label = _props3.label,
                value = _props3.value,
                canBeEmpty = _props3.canBeEmpty,
                addEmptyOption = _props3.addEmptyOption,
                emptyOption = _props3.emptyOption,
                style = _props3.style,
                async = _props3.async,
                creatable = _props3.creatable,
                multiple = _props3.multiple,
                clearable = _props3.clearable,
                other = _objectWithoutProperties(_props3, ['name', 'label', 'value', 'canBeEmpty', 'addEmptyOption', 'emptyOption', 'style', 'async', 'creatable', 'multiple', 'clearable']);

            var options = this.state.options;


            var selectOptions = [].concat(options);
            if (canBeEmpty && addEmptyOption) {
                selectOptions.unshift(emptyOption);
            }

            var shouldTakeFirstValue = !canBeEmpty && value === null && selectOptions.length > 0;
            var selectValue = shouldTakeFirstValue ? this.getValueFromOption(selectOptions[0]) : value;
            var selectClearable = clearable && shouldTakeFirstValue ? false : clearable;

            var asyncProps = async ? {
                loadOptions: this.loadOptions
            } : {
                options: selectOptions
            };

            var SelectComponent = void 0;
            if (async && creatable) {
                SelectComponent = AsyncCreatable;
            } else if (async) {
                SelectComponent = Async;
            } else if (creatable) {
                SelectComponent = Creatable;
            } else {
                SelectComponent = Select;
            }

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
                    React.createElement(SelectComponent, _extends({
                        name: 'form-field-select',
                        multi: multiple
                    }, other, asyncProps, {
                        clearable: selectClearable,
                        value: selectValue,
                        onChange: this.onChange,
                        onNewOptionClick: this.onNewOptionClick
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