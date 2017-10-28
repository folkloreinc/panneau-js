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

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _isNumber = require('lodash/isNumber');

var _isNumber2 = _interopRequireDefault(_isNumber);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _FormGroup = require('../FormGroup');

var _FormGroup2 = _interopRequireDefault(_FormGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {
    'formGroup': 'panneau-code-formGroup'
};

/**
 *  Class: CodeField
 *
 *  @param {string,number,array} value
 *  @return {string} newValue
 */

var propTypes = {
    language: _propTypes2.default.string,
    theme: _propTypes2.default.string,
    name: _propTypes2.default.string,
    label: _propTypes2.default.string,
    value: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.object]),
    width: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string]),
    height: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.string]),
    editorProps: _propTypes2.default.object, // eslint-disable-line
    isJson: _propTypes2.default.bool,
    onChange: _propTypes2.default.func
};

var defaultProps = {
    language: 'javascript',
    theme: 'github',
    name: null,
    label: null,
    value: null,
    width: '100%',
    height: 300,
    isJson: true,
    editorProps: { $blockScrolling: Infinity },
    onChange: null
};

var CodeField = function (_Component) {
    (0, _inherits3.default)(CodeField, _Component);
    (0, _createClass3.default)(CodeField, null, [{
        key: 'parse',
        value: function parse(value) {
            if (typeof value === 'undefined' || value === null) {
                return value;
            }
            return (0, _isString2.default)(value) || (0, _isNumber2.default)(value) ? value : JSON.stringify(value, null, 4);
        }
    }]);

    function CodeField(props) {
        (0, _classCallCheck3.default)(this, CodeField);

        var _this = (0, _possibleConstructorReturn3.default)(this, (CodeField.__proto__ || Object.getPrototypeOf(CodeField)).call(this, props));

        _this.AceEditor = null;
        _this.brace = null;

        _this.onChange = _this.onChange.bind(_this);

        _this.state = {
            ready: false,
            textValue: props.language === 'json' && props.isJson ? CodeField.parse(props.value) : null
        };
        return _this;
    }

    (0, _createClass3.default)(CodeField, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var _props = this.props,
                language = _props.language,
                theme = _props.theme;

            import( /* webpackChunkName: "vendor/react-ace" */'react-ace').then(function (AceEditor) {
                _this2.AceEditor = AceEditor.default;
            }).then(function () {
                return import( /* webpackChunkName: "vendor/brace" */'brace');
            }).then(function (brace) {
                _this2.brace = brace;
            }).then(function () {
                return import( /* webpackChunkName: "vendor/brace/mode/[request]" */'brace/mode/' + language);
            }).then(function () {
                return import( /* webpackChunkName: "vendor/brace/theme/[request]" */'brace/theme/' + theme);
            }).then(function () {
                _this2.setState({
                    ready: true
                });
            });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {}
    }, {
        key: 'onChange',
        value: function onChange(newValue) {
            var _props2 = this.props,
                language = _props2.language,
                onChange = _props2.onChange,
                isJson = _props2.isJson,
                value = _props2.value;


            if (language === 'json' && isJson) {
                this.setState({
                    textValue: newValue
                }, function () {
                    var val = void 0;
                    try {
                        val = JSON.parse(newValue);
                    } catch (e) {
                        val = value;
                    }
                    if (onChange) {
                        onChange(val);
                    }
                });
            } else if (onChange) {
                onChange(newValue);
            }
        }
    }, {
        key: 'renderField',
        value: function renderField() {
            var _props3 = this.props,
                language = _props3.language,
                theme = _props3.theme,
                value = _props3.value,
                isJson = _props3.isJson,
                width = _props3.width,
                height = _props3.height,
                editorProps = _props3.editorProps,
                props = (0, _objectWithoutProperties3.default)(_props3, ['language', 'theme', 'value', 'isJson', 'width', 'height', 'editorProps']);
            var textValue = this.state.textValue;


            var val = language === 'json' && isJson ? textValue : CodeField.parse(value);

            var editorWidth = (0, _isNumber2.default)(width) ? width + 'px' : width;
            var editorHeight = (0, _isNumber2.default)(height) ? height + 'px' : height;

            var AceEditor = this.AceEditor;

            return _react2.default.createElement(AceEditor, (0, _extends3.default)({}, props, {
                mode: language,
                theme: theme,
                value: val || '',
                width: editorWidth,
                height: editorHeight,
                editorProps: editorProps,
                onChange: this.onChange
            }));
        }
    }, {
        key: 'render',
        value: function render() {
            var _props4 = this.props,
                name = _props4.name,
                label = _props4.label,
                other = (0, _objectWithoutProperties3.default)(_props4, ['name', 'label']);
            var ready = this.state.ready;


            return _react2.default.createElement(
                _FormGroup2.default,
                (0, _extends3.default)({ className: styles.formGroup + ' form-group-code', name: name, label: label }, other),
                ready ? this.renderField() : null
            );
        }
    }]);
    return CodeField;
}(_react.Component);

CodeField.propTypes = propTypes;
CodeField.defaultProps = defaultProps;

exports.default = CodeField;