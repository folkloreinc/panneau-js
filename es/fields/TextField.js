import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';
import _extends from 'babel-runtime/helpers/extends';
import _defineProperty from 'babel-runtime/helpers/defineProperty';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _createClass from 'babel-runtime/helpers/createClass';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import FormGroup from '../FormGroup';

/**
 *  Class: TextField
 *
 *  @param {string,number,array} value
 *  @return {string} newValue
 */
var propTypes = {
    type: PropTypes.oneOf(['text', 'email', 'password', 'url', 'number', 'textarea', 'editor']),
    name: PropTypes.string,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,

    prefix: PropTypes.node,
    suffix: PropTypes.node,
    prefixClassName: PropTypes.string,
    suffixClassName: PropTypes.string,
    align: PropTypes.oneOf(['left', 'right', 'center']),
    inputOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    ckeditorConfig: PropTypes.object, // eslint-disable-line
    ckeditorCustomConfig: PropTypes.string,
    ckeditorBasePath: PropTypes.string
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
    _inherits(TextField, _Component);

    _createClass(TextField, null, [{
        key: 'parse',
        value: function parse(value) {
            if (isString(value) || isNumber(value)) {
                return value;
            } else if (isArray(value)) {
                return value.join(' ');
            }
            return ''; // Empty string for the input field
        }
    }]);

    function TextField(props) {
        _classCallCheck(this, TextField);

        var _this = _possibleConstructorReturn(this, (TextField.__proto__ || Object.getPrototypeOf(TextField)).call(this, props));

        _this.onChange = _this.onChange.bind(_this);
        _this.onEditorReady = _this.onEditorReady.bind(_this);
        _this.onEditorChange = _this.onEditorChange.bind(_this);

        _this.editor = null;
        _this.input = null;
        _this.ckeditor = null;
        return _this;
    }

    _createClass(TextField, [{
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

            var inputClassNames = classNames((_classNames = {
                'form-control': true
            }, _defineProperty(_classNames, 'field-' + type, true), _defineProperty(_classNames, 'text-' + align, align !== null), _classNames));

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
                input = React.createElement('textarea', inputProps);
            } else if (type === 'editor') {
                input = React.createElement(
                    'div',
                    { className: 'editor' },
                    React.createElement('textarea', {
                        className: 'field-editor',
                        name: 'editor',
                        ref: function ref(el) {
                            _this3.editor = el;
                        }
                    }),
                    React.createElement('input', {
                        type: 'hidden',
                        name: name,
                        value: inputValue
                    })
                );
            } else {
                input = React.createElement('input', _extends({}, inputProps, {
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


            var prefixClassNames = classNames(_defineProperty({
                'input-group-addon': prefixClassName === null && isString(prefix),
                'input-group-addon input-group-addon-small': prefixClassName === null && !isString(prefix)
            }, prefixClassName, prefixClassName !== null));

            var suffixClassNames = classNames(_defineProperty({
                'input-group-addon': suffixClassName === null && isString(suffix),
                'input-group-addon input-group-addon-small': suffixClassName === null && !isString(suffix)
            }, suffixClassName, suffixClassName !== null));

            var renderedPrefix = prefix ? React.createElement(
                'span',
                { className: prefixClassNames },
                prefix
            ) : null;

            var renderedSuffix = suffix ? React.createElement(
                'span',
                { className: suffixClassNames },
                suffix
            ) : null;

            var groupClassNames = classNames(_defineProperty({
                'input-group': true,
                'input-group-text': true
            }, 'input-group-' + type, true));

            return React.createElement(
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
                other = _objectWithoutProperties(_props5, ['label', 'name', 'prefix', 'suffix']);

            var input = this.renderInput();
            var inputGroup = prefix || suffix ? this.renderInputGroup(input) : input;
            return React.createElement(
                FormGroup,
                _extends({
                    className: 'form-group-text',
                    name: name,
                    label: label
                }, other),
                inputGroup
            );
        }
    }]);

    return TextField;
}(Component);

TextField.propTypes = propTypes;
TextField.defaultProps = defaultProps;

export default TextField;