import _extends from 'babel-runtime/helpers/extends';
import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';
import _defineProperty from 'babel-runtime/helpers/defineProperty';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isObject from 'lodash/isObject';
import isEmpty from 'lodash/isEmpty';

import FormGroup from '../FormGroup';
import TextField from './TextField';
import Popover from '../modals/Popover';

var styles = {
    'formGroup': 'panneau-date-formGroup',
    'input': 'panneau-date-input',
    'popover': 'panneau-date-popover'
};


var propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    startLabel: PropTypes.string,
    endLabel: PropTypes.string,
    startPlaceholder: PropTypes.string,
    endPlaceholder: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({
        start: PropTypes.string,
        end: PropTypes.string
    })]),
    type: PropTypes.oneOf(['date', 'daterange']),
    dateFormat: PropTypes.string,
    onChange: PropTypes.func
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
    if (isEmpty(str)) {
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
    _inherits(DateField, _Component);

    function DateField(props) {
        _classCallCheck(this, DateField);

        var _this = _possibleConstructorReturn(this, (DateField.__proto__ || Object.getPrototypeOf(DateField)).call(this, props));

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

    _createClass(DateField, [{
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
                        start: isObject(value) ? getMomentOrNull(_this2.moment, value.start) : _this2.moment(),
                        end: isObject(value) ? getMomentOrNull(_this2.moment, value.end) : _this2.moment()
                    } : getMomentOrNull(_this2.moment, value)
                });
            });
        }
    }, {
        key: 'onChange',
        value: function onChange(value) {
            var _this3 = this;

            var dateFormat = this.props.dateFormat;

            var textValue = isObject(value) ? value.format(dateFormat) : null;
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
                start: isObject(newMomentValue.start) && newMomentValue.start.isValid() ? newMomentValue.start.format(dateFormat) : null,
                end: isObject(newMomentValue.end) && newMomentValue.end.isValid() ? newMomentValue.end.format(dateFormat) : null
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

            var dateValue = !isEmpty(val) ? this.moment(val) : null;
            var newTextValue = Object.assign({}, textValue, _defineProperty({}, key, val));
            var newMomentValue = Object.assign({}, momentValue, _defineProperty({}, key, dateValue !== null && dateValue.isValid() ? dateValue : null));
            this.setState({
                textValue: newTextValue,
                momentValue: newMomentValue
            }, function () {
                var newValue = Object.assign({}, value, _defineProperty({}, key, isObject(newMomentValue) && newMomentValue[key] !== null ? newMomentValue[key].format(dateFormat) : null));
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
                var startValue = isObject(textValue) ? textValue.start || null : null;
                var endValue = isObject(textValue) ? textValue.end || null : null;
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

                var startSuffix = React.createElement('button', {
                    type: 'button',
                    className: 'btn btn-default glyphicon glyphicon-calendar',
                    onClick: onStartClickInputButton
                });

                var endSuffix = React.createElement('button', {
                    type: 'button',
                    className: 'btn btn-default glyphicon glyphicon-calendar',
                    onClick: onEndClickInputButton
                });

                return React.createElement(
                    'div',
                    { className: styles.input },
                    React.createElement(
                        'div',
                        { className: 'row' },
                        React.createElement(
                            'div',
                            { className: 'col-xs-6' },
                            React.createElement(TextField, {
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
                        React.createElement(
                            'div',
                            { className: 'col-xs-6' },
                            React.createElement(TextField, {
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

            var suffix = React.createElement('button', {
                type: 'button',
                className: 'btn btn-default glyphicon glyphicon-calendar',
                onClick: this.onInputFocus
            });

            return React.createElement(TextField, {
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
                other = _objectWithoutProperties(_props4, ['name', 'label', 'value', 'type', 'onChange', 'dateFormat', 'startLabel', 'endLabel', 'startPlaceholder', 'endPlaceholder', 'placeholder']);

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

            return React.createElement(
                Popover,
                {
                    className: styles.popover,
                    onClose: this.onClose
                },
                React.createElement(DateComponent, _extends({}, pickerProps, other))
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
                other = _objectWithoutProperties(_props5, ['name', 'label', 'value', 'type', 'onChange', 'dateFormat']);

            var _state3 = this.state,
                ready = _state3.ready,
                opened = _state3.opened;


            if (!ready) {
                return null;
            }

            return React.createElement(
                FormGroup,
                _extends({}, other, {
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
}(Component);

DateField.propTypes = propTypes;
DateField.defaultProps = defaultProps;

export default DateField;