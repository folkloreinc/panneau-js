'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _isObject = require('lodash/isObject');

var _isObject2 = _interopRequireDefault(_isObject);

var _reactSelect = require('react-select');

var _reactSelect2 = _interopRequireDefault(_reactSelect);

var _FormGroup = require('../FormGroup');

var _FormGroup2 = _interopRequireDefault(_FormGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var valuePropTypes = _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number, _propTypes2.default.array, _propTypes2.default.object]);

var propTypes = {
    name: _propTypes2.default.string,
    label: _propTypes2.default.string,
    value: valuePropTypes,
    options: _propTypes2.default.arrayOf(_propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.shape({
        value: _propTypes2.default.any,
        label: _propTypes2.default.string
    })])),
    getValueFromOption: _propTypes2.default.func,
    onChange: _propTypes2.default.func,
    onOptionsChange: _propTypes2.default.func,

    placeholder: _propTypes2.default.string,
    noResultsText: _propTypes2.default.string,
    canBeEmpty: _propTypes2.default.bool,
    addEmptyOption: _propTypes2.default.bool,
    emptyOption: _propTypes2.default.shape({
        value: valuePropTypes,
        label: _propTypes2.default.string
    }),
    loadOptions: _propTypes2.default.func,
    fetchOptions: _propTypes2.default.func,
    async: _propTypes2.default.bool,
    multiple: _propTypes2.default.bool,
    searchable: _propTypes2.default.bool,
    clearable: _propTypes2.default.bool,
    creatable: _propTypes2.default.bool,
    style: _propTypes2.default.object // eslint-disable-line
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
    (0, _inherits3.default)(SelectField, _Component);

    function SelectField(props) {
        (0, _classCallCheck3.default)(this, SelectField);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SelectField.__proto__ || Object.getPrototypeOf(SelectField)).call(this, props));

        _this.onChange = _this.onChange.bind(_this);
        _this.onNewOptionClick = _this.onNewOptionClick.bind(_this);
        _this.getValueFromOption = _this.getValueFromOption.bind(_this);

        _this.state = {
            options: props.options
        };
        return _this;
    }

    (0, _createClass3.default)(SelectField, [{
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
                options: [].concat((0, _toConsumableArray3.default)(options), [option])
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
            return (0, _isObject2.default)(opt) && typeof opt.value !== 'undefined' ? opt.value : opt;
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
                other = (0, _objectWithoutProperties3.default)(_props3, ['name', 'label', 'value', 'canBeEmpty', 'addEmptyOption', 'emptyOption', 'style', 'async', 'creatable', 'multiple', 'clearable']);
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
                SelectComponent = _reactSelect.AsyncCreatable;
            } else if (async) {
                SelectComponent = _reactSelect.Async;
            } else if (creatable) {
                SelectComponent = _reactSelect.Creatable;
            } else {
                SelectComponent = _reactSelect2.default;
            }

            return _react2.default.createElement(
                _FormGroup2.default,
                (0, _extends3.default)({}, other, {
                    className: 'form-group-select',
                    name: name,
                    label: label
                }),
                _react2.default.createElement(
                    'div',
                    { style: style },
                    _react2.default.createElement(SelectComponent, (0, _extends3.default)({
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
}(_react.Component);

SelectField.propTypes = propTypes;
SelectField.defaultProps = defaultProps;

exports.default = SelectField;