'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _isNumber = require('lodash/isNumber');

var _isNumber2 = _interopRequireDefault(_isNumber);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _FormGroup = require('../FormGroup');

var _FormGroup2 = _interopRequireDefault(_FormGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *  Class: TextField
 *
 *  @param {string,number,array} value
 *  @return {string} newValue
 */
var propTypes = {
    type: _propTypes2.default.oneOf(['text', 'email', 'password', 'url', 'number', 'textarea', 'editor']),
    name: _propTypes2.default.string,
    label: _propTypes2.default.string,
    placeholder: _propTypes2.default.string,
    value: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
    onChange: _propTypes2.default.func,
    onFocus: _propTypes2.default.func,
    onBlur: _propTypes2.default.func,

    prefix: _propTypes2.default.node,
    suffix: _propTypes2.default.node,
    prefixClassName: _propTypes2.default.string,
    suffixClassName: _propTypes2.default.string,
    align: _propTypes2.default.oneOf(['left', 'right', 'center']),
    inputOnly: _propTypes2.default.bool,
    disabled: _propTypes2.default.bool,
    ckeditorConfig: _propTypes2.default.object, // eslint-disable-line
    ckeditorCustomConfig: _propTypes2.default.string,
    ckeditorBasePath: _propTypes2.default.string
};

var defaultProps = {
    type: 'text',
    name: null,
    label: null,
    placeholder: null,
    value: null,
    onChange: null,
    onFocus: null,
    onBlur: null,

    prefix: null,
    suffix: null,
    prefixClassName: null,
    suffixClassName: null,
    align: null,
    inputOnly: false,
    disabled: false,
    ckeditorConfig: null,
    ckeditorCustomConfig: null,
    ckeditorBasePath: 'https://cdn.ckeditor.com/4.7.2/standard/'
};

var TextField = function (_Component) {
    (0, _inherits3.default)(TextField, _Component);
    (0, _createClass3.default)(TextField, null, [{
        key: 'parse',
        value: function parse(value) {
            if ((0, _isString2.default)(value) || (0, _isNumber2.default)(value)) {
                return value;
            } else if ((0, _isArray2.default)(value)) {
                return value.join(' ');
            }
            return ''; // Empty string for the input field
        }
    }]);

    function TextField(props) {
        (0, _classCallCheck3.default)(this, TextField);

        var _this = (0, _possibleConstructorReturn3.default)(this, (TextField.__proto__ || Object.getPrototypeOf(TextField)).call(this, props));

        _this.onChange = _this.onChange.bind(_this);
        _this.onEditorReady = _this.onEditorReady.bind(_this);
        _this.onEditorChange = _this.onEditorChange.bind(_this);

        _this.editor = null;
        _this.input = null;
        _this.ckeditor = null;
        return _this;
    }

    (0, _createClass3.default)(TextField, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var _props = this.props,
                type = _props.type,
                ckeditorBasePath = _props.ckeditorBasePath;

            if (type === 'editor') {
                window.CKEDITOR_BASEPATH = ckeditorBasePath;
                import( /* webpackChunkName: "vendor/ckeditor" */'ckeditor').then(function () {
                    var _props2 = _this2.props,
                        ckeditorConfig = _props2.ckeditorConfig,
                        ckeditorCustomConfig = _props2.ckeditorCustomConfig;

                    _this2.ckeditor = CKEDITOR; // eslint-disable-line no-undef
                    var editor = _this2.ckeditor.replace(_this2.editor, Object.assign({
                        customConfig: ckeditorCustomConfig
                    }, ckeditorConfig || {}));
                    editor.on('instanceReady', _this2.onEditorReady);
                    editor.on('change', _this2.onEditorChange);
                });
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            var type = this.props.type;

            if (type === 'editor') {
                this.ckeditor.remove(this.editor);
            }
        }
    }, {
        key: 'onEditorReady',
        value: function onEditorReady(e) {
            e.editor.setData(this.props.value);
        }
    }, {
        key: 'onChange',
        value: function onChange(e) {
            var newValue = (e.currentTarget || this.input).value;
            if (this.props.onChange) {
                this.props.onChange(newValue);
            }
        }
    }, {
        key: 'onEditorChange',
        value: function onEditorChange(e) {
            var newValue = e.editor.getData();
            if (this.props.onChange) {
                this.props.onChange(newValue);
            }
        }
    }, {
        key: 'getInput',
        value: function getInput() {
            return this.input;
        }
    }, {
        key: 'renderInput',
        value: function renderInput() {
            var _classNames,
                _this3 = this;

            var _props3 = this.props,
                type = _props3.type,
                name = _props3.name,
                placeholder = _props3.placeholder,
                value = _props3.value,
                align = _props3.align,
                disabled = _props3.disabled,
                onFocus = _props3.onFocus,
                onBlur = _props3.onBlur;

            var inputValue = TextField.parse(value);

            var inputClassNames = (0, _classnames2.default)((_classNames = {
                'form-control': true
            }, (0, _defineProperty3.default)(_classNames, 'field-' + type, true), (0, _defineProperty3.default)(_classNames, 'text-' + align, align !== null), _classNames));

            var inputProps = {
                ref: function ref(_ref) {
                    _this3.input = _ref;
                },
                value: inputValue,
                name: name,
                id: name,
                placeholder: placeholder,
                disabled: disabled,
                className: inputClassNames,
                onChange: this.onChange,
                onFocus: onFocus,
                onBlur: onBlur
            };

            var input = null;
            if (type === 'textarea') {
                input = _react2.default.createElement('textarea', inputProps);
            } else if (type === 'editor') {
                input = _react2.default.createElement(
                    'div',
                    { className: 'editor' },
                    _react2.default.createElement('textarea', {
                        className: 'field-editor',
                        name: 'editor',
                        ref: function ref(el) {
                            _this3.editor = el;
                        }
                    }),
                    _react2.default.createElement('input', {
                        type: 'hidden',
                        name: name,
                        value: inputValue
                    })
                );
            } else {
                input = _react2.default.createElement('input', (0, _extends3.default)({}, inputProps, {
                    type: type
                }));
            }
            return input;
        }
    }, {
        key: 'renderInputGroup',
        value: function renderInputGroup(input) {
            var _props4 = this.props,
                type = _props4.type,
                prefix = _props4.prefix,
                suffix = _props4.suffix,
                prefixClassName = _props4.prefixClassName,
                suffixClassName = _props4.suffixClassName;


            var prefixClassNames = (0, _classnames2.default)((0, _defineProperty3.default)({
                'input-group-addon': prefixClassName === null && (0, _isString2.default)(prefix),
                'input-group-addon input-group-addon-small': prefixClassName === null && !(0, _isString2.default)(prefix)
            }, prefixClassName, prefixClassName !== null));

            var suffixClassNames = (0, _classnames2.default)((0, _defineProperty3.default)({
                'input-group-addon': suffixClassName === null && (0, _isString2.default)(suffix),
                'input-group-addon input-group-addon-small': suffixClassName === null && !(0, _isString2.default)(suffix)
            }, suffixClassName, suffixClassName !== null));

            var renderedPrefix = prefix ? _react2.default.createElement(
                'span',
                { className: prefixClassNames },
                prefix
            ) : null;

            var renderedSuffix = suffix ? _react2.default.createElement(
                'span',
                { className: suffixClassNames },
                suffix
            ) : null;

            var groupClassNames = (0, _classnames2.default)((0, _defineProperty3.default)({
                'input-group': true,
                'input-group-text': true
            }, 'input-group-' + type, true));

            return _react2.default.createElement(
                'div',
                { className: groupClassNames },
                renderedPrefix,
                input,
                renderedSuffix
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _props5 = this.props,
                label = _props5.label,
                name = _props5.name,
                prefix = _props5.prefix,
                suffix = _props5.suffix,
                other = (0, _objectWithoutProperties3.default)(_props5, ['label', 'name', 'prefix', 'suffix']);

            var input = this.renderInput();
            var inputGroup = prefix || suffix ? this.renderInputGroup(input) : input;
            return _react2.default.createElement(
                _FormGroup2.default,
                (0, _extends3.default)({
                    className: 'form-group-text',
                    name: name,
                    label: label
                }, other),
                inputGroup
            );
        }
    }]);
    return TextField;
}(_react.Component);

TextField.propTypes = propTypes;
TextField.defaultProps = defaultProps;

exports.default = TextField;