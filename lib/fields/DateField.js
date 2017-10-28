'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

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

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _FormGroup = require('../FormGroup');

var _FormGroup2 = _interopRequireDefault(_FormGroup);

var _TextField = require('./TextField');

var _TextField2 = _interopRequireDefault(_TextField);

var _Popover = require('../modals/Popover');

var _Popover2 = _interopRequireDefault(_Popover);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {
    'formGroup': 'panneau-date-formGroup',
    'input': 'panneau-date-input',
    'popover': 'panneau-date-popover'
};


var propTypes = {
    name: _propTypes2.default.string,
    label: _propTypes2.default.string,
    startLabel: _propTypes2.default.string,
    endLabel: _propTypes2.default.string,
    startPlaceholder: _propTypes2.default.string,
    endPlaceholder: _propTypes2.default.string,
    placeholder: _propTypes2.default.string,
    value: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.shape({
        start: _propTypes2.default.string,
        end: _propTypes2.default.string
    })]),
    type: _propTypes2.default.oneOf(['date', 'daterange']),
    dateFormat: _propTypes2.default.string,
    onChange: _propTypes2.default.func
};

var defaultProps = {
    name: 'name',
    label: 'label',
    startLabel: 'Start date',
    endLabel: 'End date',
    startPlaceholder: null,
    endPlaceholder: null,
    placeholder: null,
    value: null,
    type: 'date',
    dateFormat: 'YYYY-MM-DD',
    onChange: null
};

var getMomentOrNull = function getMomentOrNull(moment, str) {
    if ((0, _isEmpty2.default)(str)) {
        return null;
    }
    var date = moment(str);
    if (!date.isValid()) {
        return null;
    }
    return date;
};

var getDateFormatted = function getDateFormatted(moment, str, format) {
    var date = getMomentOrNull(moment, str);
    return date !== null ? date.format(format) : null;
};

var DateField = function (_Component) {
    (0, _inherits3.default)(DateField, _Component);

    function DateField(props) {
        (0, _classCallCheck3.default)(this, DateField);

        var _this = (0, _possibleConstructorReturn3.default)(this, (DateField.__proto__ || Object.getPrototypeOf(DateField)).call(this, props));

        _this.onChange = _this.onChange.bind(_this);
        _this.onRangeChange = _this.onRangeChange.bind(_this);
        _this.onInputChange = _this.onInputChange.bind(_this);
        _this.onInputRangeChange = _this.onInputRangeChange.bind(_this);
        _this.onFocusChange = _this.onFocusChange.bind(_this);
        _this.onInputFocus = _this.onInputFocus.bind(_this);
        _this.onInputRangeFocus = _this.onInputRangeFocus.bind(_this);
        _this.onClose = _this.onClose.bind(_this);
        _this.Component = null;
        _this.moment = null;
        _this.input = null;
        _this.startInput = null;
        _this.endInput = null;

        _this.state = {
            ready: false,
            opened: false,
            focusedInput: 'startDate',
            momentValue: null,
            textValue: null,
            focused: null
        };
        return _this;
    }

    (0, _createClass3.default)(DateField, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var _props = this.props,
                type = _props.type,
                value = _props.value;

            var componentName = void 0;
            if (type === 'daterange') {
                componentName = 'DayPickerRangeController';
            } else {
                componentName = 'DayPickerSingleDateController';
            }
            import( /* webpackChunkName: "vendor/react-dates/[request]" */'react-dates/lib/components/' + componentName).then(function (dep) {
                _this2.Component = dep.default;
                return import( /* webpackChunkName: "vendor/moment" */'moment');
            }).then(function (dep) {
                _this2.moment = dep;
                _this2.setState({
                    ready: true,
                    momentValue: type === 'daterange' ? {
                        start: (0, _isObject2.default)(value) ? getMomentOrNull(_this2.moment, value.start) : _this2.moment(),
                        end: (0, _isObject2.default)(value) ? getMomentOrNull(_this2.moment, value.end) : _this2.moment()
                    } : getMomentOrNull(_this2.moment, value)
                });
            });
        }
    }, {
        key: 'onChange',
        value: function onChange(value) {
            var _this3 = this;

            var dateFormat = this.props.dateFormat;

            var textValue = (0, _isObject2.default)(value) ? value.format(dateFormat) : null;
            this.setState({
                textValue: textValue,
                momentValue: value
            }, function () {
                if (_this3.props.onChange) {
                    _this3.props.onChange(textValue);
                }
            });
        }
    }, {
        key: 'onRangeChange',
        value: function onRangeChange(_ref) {
            var _this4 = this;

            var startDate = _ref.startDate,
                endDate = _ref.endDate;
            var dateFormat = this.props.dateFormat;
            var momentValue = this.state.momentValue;

            var newMomentValue = {
                start: typeof startDate === 'undefined' ? momentValue.start : startDate,
                end: typeof endDate === 'undefined' ? momentValue.end : endDate
            };
            var textValue = {
                start: (0, _isObject2.default)(newMomentValue.start) && newMomentValue.start.isValid() ? newMomentValue.start.format(dateFormat) : null,
                end: (0, _isObject2.default)(newMomentValue.end) && newMomentValue.end.isValid() ? newMomentValue.end.format(dateFormat) : null
            };
            this.setState({
                textValue: textValue,
                momentValue: newMomentValue
            }, function () {
                if (_this4.props.onChange) {
                    _this4.props.onChange(textValue);
                }
            });
        }
    }, {
        key: 'onInputChange',
        value: function onInputChange(val) {
            var _this5 = this;

            var dateFormat = this.props.dateFormat;

            var newValue = getDateFormatted(this.moment, val, dateFormat);
            this.setState({
                textValue: val,
                momentValue: newValue
            }, function () {
                if (_this5.props.onChange) {
                    _this5.props.onChange(newValue);
                }
            });
        }
    }, {
        key: 'onInputRangeChange',
        value: function onInputRangeChange(key, val) {
            var _this6 = this;

            var _props2 = this.props,
                value = _props2.value,
                dateFormat = _props2.dateFormat;
            var _state = this.state,
                textValue = _state.textValue,
                momentValue = _state.momentValue;

            var dateValue = !(0, _isEmpty2.default)(val) ? this.moment(val) : null;
            var newTextValue = Object.assign({}, textValue, (0, _defineProperty3.default)({}, key, val));
            var newMomentValue = Object.assign({}, momentValue, (0, _defineProperty3.default)({}, key, dateValue !== null && dateValue.isValid() ? dateValue : null));
            this.setState({
                textValue: newTextValue,
                momentValue: newMomentValue
            }, function () {
                var newValue = Object.assign({}, value, (0, _defineProperty3.default)({}, key, (0, _isObject2.default)(newMomentValue) && newMomentValue[key] !== null ? newMomentValue[key].format(dateFormat) : null));
                if (_this6.props.onChange) {
                    _this6.props.onChange(newValue);
                }
            });
        }
    }, {
        key: 'onFocusChange',
        value: function onFocusChange(input) {
            this.setState({
                focusedInput: !input ? 'startDate' : input
            });
        }
    }, {
        key: 'onInputFocus',
        value: function onInputFocus() {
            this.setState({
                opened: true
            });
        }
    }, {
        key: 'onInputRangeFocus',
        value: function onInputRangeFocus(key) {
            this.setState({
                opened: true,
                focusedInput: key + 'Date'
            });
        }
    }, {
        key: 'onClose',
        value: function onClose(e) {
            if (this.input !== null && e.target === this.input.getInput() || this.startInput !== null && e.target === this.startInput.getInput() || this.endInput !== null && e.target === this.endInput.getInput()) {
                return;
            }
            this.setState({
                opened: false,
                focusedInput: null
            });
        }
    }, {
        key: 'renderInput',
        value: function renderInput() {
            var _this7 = this;

            var _props3 = this.props,
                type = _props3.type,
                startLabel = _props3.startLabel,
                endLabel = _props3.endLabel,
                startPlaceholder = _props3.startPlaceholder,
                endPlaceholder = _props3.endPlaceholder,
                placeholder = _props3.placeholder;
            var textValue = this.state.textValue;


            if (type === 'daterange') {
                var startValue = (0, _isObject2.default)(textValue) ? textValue.start || null : null;
                var endValue = (0, _isObject2.default)(textValue) ? textValue.end || null : null;
                var onStartChange = function onStartChange(val) {
                    return _this7.onInputRangeChange('start', val);
                };
                var onEndChange = function onEndChange(val) {
                    return _this7.onInputRangeChange('end', val);
                };
                var onStartFocus = function onStartFocus(e) {
                    return _this7.onInputRangeFocus('start', e);
                };
                var onEndFocus = function onEndFocus(e) {
                    return _this7.onInputRangeFocus('end', e);
                };
                var onStartClickInputButton = function onStartClickInputButton(e) {
                    return _this7.onInputRangeFocus('start', e);
                };
                var onEndClickInputButton = function onEndClickInputButton(e) {
                    return _this7.onInputRangeFocus('end', e);
                };

                var startSuffix = _react2.default.createElement('button', {
                    type: 'button',
                    className: 'btn btn-default glyphicon glyphicon-calendar',
                    onClick: onStartClickInputButton
                });

                var endSuffix = _react2.default.createElement('button', {
                    type: 'button',
                    className: 'btn btn-default glyphicon glyphicon-calendar',
                    onClick: onEndClickInputButton
                });

                return _react2.default.createElement(
                    'div',
                    { className: styles.input },
                    _react2.default.createElement(
                        'div',
                        { className: 'row' },
                        _react2.default.createElement(
                            'div',
                            { className: 'col-xs-6' },
                            _react2.default.createElement(_TextField2.default, {
                                ref: function ref(_ref2) {
                                    _this7.startInput = _ref2;
                                },
                                label: startLabel,
                                placeholder: startPlaceholder,
                                value: startValue,
                                onChange: onStartChange,
                                onFocus: onStartFocus,
                                suffix: startSuffix,
                                suffixClassName: 'input-group-btn'
                            })
                        ),
                        _react2.default.createElement(
                            'div',
                            { className: 'col-xs-6' },
                            _react2.default.createElement(_TextField2.default, {
                                ref: function ref(_ref3) {
                                    _this7.endInput = _ref3;
                                },
                                label: endLabel,
                                placeholder: endPlaceholder,
                                value: endValue,
                                onChange: onEndChange,
                                onFocus: onEndFocus,
                                suffix: endSuffix,
                                suffixClassName: 'input-group-btn'
                            })
                        )
                    )
                );
            }

            var suffix = _react2.default.createElement('button', {
                type: 'button',
                className: 'btn btn-default glyphicon glyphicon-calendar',
                onClick: this.onInputFocus
            });

            return _react2.default.createElement(_TextField2.default, {
                ref: function ref(_ref4) {
                    _this7.input = _ref4;
                },
                value: textValue,
                placeholder: placeholder,
                onChange: this.onInputChange,
                onFocus: this.onInputFocus,
                suffix: suffix,
                suffixClassName: 'input-group-btn'
            });
        }
    }, {
        key: 'renderPopover',
        value: function renderPopover() {
            var _props4 = this.props,
                name = _props4.name,
                label = _props4.label,
                value = _props4.value,
                type = _props4.type,
                onChange = _props4.onChange,
                dateFormat = _props4.dateFormat,
                startLabel = _props4.startLabel,
                endLabel = _props4.endLabel,
                startPlaceholder = _props4.startPlaceholder,
                endPlaceholder = _props4.endPlaceholder,
                placeholder = _props4.placeholder,
                other = (0, _objectWithoutProperties3.default)(_props4, ['name', 'label', 'value', 'type', 'onChange', 'dateFormat', 'startLabel', 'endLabel', 'startPlaceholder', 'endPlaceholder', 'placeholder']);
            var _state2 = this.state,
                momentValue = _state2.momentValue,
                focusedInput = _state2.focusedInput;


            var DateComponent = this.Component;

            var pickerProps = type === 'daterange' ? {
                startDate: momentValue.start,
                endDate: momentValue.end,
                onDatesChange: this.onRangeChange,
                focusedInput: focusedInput,
                numberOfMonths: 2,
                onFocusChange: this.onFocusChange
            } : {
                date: momentValue,
                onDateChange: this.onChange,
                focused: true
            };

            return _react2.default.createElement(
                _Popover2.default,
                {
                    className: styles.popover,
                    onClose: this.onClose
                },
                _react2.default.createElement(DateComponent, (0, _extends3.default)({}, pickerProps, other))
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _props5 = this.props,
                name = _props5.name,
                label = _props5.label,
                value = _props5.value,
                type = _props5.type,
                onChange = _props5.onChange,
                dateFormat = _props5.dateFormat,
                other = (0, _objectWithoutProperties3.default)(_props5, ['name', 'label', 'value', 'type', 'onChange', 'dateFormat']);
            var _state3 = this.state,
                ready = _state3.ready,
                opened = _state3.opened;


            if (!ready) {
                return null;
            }

            return _react2.default.createElement(
                _FormGroup2.default,
                (0, _extends3.default)({}, other, {
                    className: 'form-group-date ' + styles.formGroup,
                    name: name,
                    label: label
                }),
                this.renderInput(),
                opened ? this.renderPopover() : null
            );
        }
    }]);
    return DateField;
}(_react.Component);

DateField.propTypes = propTypes;
DateField.defaultProps = defaultProps;

exports.default = DateField;