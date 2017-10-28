'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

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

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _FormGroup = require('../FormGroup');

var _FormGroup2 = _interopRequireDefault(_FormGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var propTypes = {
    name: _propTypes2.default.string,
    label: _propTypes2.default.string,
    value: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number, // Numbers are simple and tested
    _propTypes2.default.array]),
    defaultValue: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number, // Numbers are simple and tested
    _propTypes2.default.array]),
    min: _propTypes2.default.number,
    max: _propTypes2.default.number,
    step: _propTypes2.default.number,
    range: _propTypes2.default.bool,
    onChange: _propTypes2.default.func
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
    (0, _inherits3.default)(SliderField, _Component);

    function SliderField(props) {
        (0, _classCallCheck3.default)(this, SliderField);

        var _this = (0, _possibleConstructorReturn3.default)(this, (SliderField.__proto__ || Object.getPrototypeOf(SliderField)).call(this, props));

        _this.onChange = _this.onChange.bind(_this);
        _this.slider = null;
        _this.Component = null;

        _this.state = {
            ready: false
        };
        return _this;
    }

    (0, _createClass3.default)(SliderField, [{
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

            var newValue = range && (0, _isArray2.default)(value) && value.length === 0 ? null : value;
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
                other = (0, _objectWithoutProperties3.default)(_props, ['name', 'label', 'value', 'range']);
            var ready = this.state.ready;


            if (!ready) {
                return null;
            }

            var SliderComponent = this.Component;
            var sliderValue = range && (0, _isEmpty2.default)(value) ? [] : value;

            return _react2.default.createElement(
                _FormGroup2.default,
                (0, _extends3.default)({}, other, {
                    className: 'form-group-slider',
                    name: name,
                    label: label
                }),
                _react2.default.createElement(SliderComponent, (0, _extends3.default)({}, other, {
                    value: sliderValue,
                    onChange: this.onChange
                }))
            );
        }
    }]);
    return SliderField;
}(_react.Component);

SliderField.propTypes = propTypes;
SliderField.defaultProps = defaultProps;

exports.default = SliderField;