import _extends from 'babel-runtime/helpers/extends';
import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import isArray from 'lodash/isArray';

import FormGroup from '../FormGroup';

var propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, // Numbers are simple and tested
    PropTypes.array]),
    defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number, // Numbers are simple and tested
    PropTypes.array]),
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    range: PropTypes.bool,
    onChange: PropTypes.func
};

var defaultProps = {
    name: 'name',
    label: 'label',
    value: null,
    defaultValue: null,
    min: 0,
    max: 100,
    step: 1,
    range: false,
    onChange: null
};

var SliderField = function (_Component) {
    _inherits(SliderField, _Component);

    function SliderField(props) {
        _classCallCheck(this, SliderField);

        var _this = _possibleConstructorReturn(this, (SliderField.__proto__ || Object.getPrototypeOf(SliderField)).call(this, props));

        _this.onChange = _this.onChange.bind(_this);
        _this.slider = null;
        _this.Component = null;

        _this.state = {
            ready: false
        };
        return _this;
    }

    _createClass(SliderField, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var range = this.props.range;

            var componentName = range ? 'Range' : 'Slider';
            import( /* webpackChunkName: "vendor/rc-slider/[request]" */'rc-slider/lib/' + componentName).then(function (SliderComponent) {
                _this2.Component = SliderComponent;
                _this2.setState({
                    ready: true
                });
            });
        }
    }, {
        key: 'onChange',
        value: function onChange(value) {
            var range = this.props.range;

            var newValue = range && isArray(value) && value.length === 0 ? null : value;
            if (this.props.onChange) {
                this.props.onChange(newValue);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                name = _props.name,
                label = _props.label,
                value = _props.value,
                range = _props.range,
                other = _objectWithoutProperties(_props, ['name', 'label', 'value', 'range']);

            var ready = this.state.ready;


            if (!ready) {
                return null;
            }

            var SliderComponent = this.Component;
            var sliderValue = range && isEmpty(value) ? [] : value;

            return React.createElement(
                FormGroup,
                _extends({}, other, {
                    className: 'form-group-slider',
                    name: name,
                    label: label
                }),
                React.createElement(SliderComponent, _extends({}, other, {
                    value: sliderValue,
                    onChange: this.onChange
                }))
            );
        }
    }]);

    return SliderField;
}(Component);

SliderField.propTypes = propTypes;
SliderField.defaultProps = defaultProps;

export default SliderField;