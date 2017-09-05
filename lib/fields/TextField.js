import _extends from 'babel-runtime/helpers/extends';
import _defineProperty from 'babel-runtime/helpers/defineProperty';
import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';
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

    prefix: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    suffix: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    align: PropTypes.oneOf(['left', 'right', 'center']),
    disabled: PropTypes.bool,
    ckeditorCustomConfig: PropTypes.object
};

var defaultProps = {
    type: 'text',
    name: null,
    label: null,
    placeholder: null,
    value: null,
    onChange: null,

    prefix: null,
    suffix: null,
    align: null,
    disabled: false,
    ckeditorCustomConfig: {}
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
        _this.ckeditor = null;
        return _this;
    }

    _createClass(TextField, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var _this2 = this;

            var type = this.props.type;

            if (type === 'editor') {
                import( /* webpackChunkName: "vendor/ckeditor" */'ckeditor').then(function () {
                    _this2.ckeditor = CKEDITOR; // eslint-disable-line no-undef
                    var editor = _this2.ckeditor.replace('editor');
                    if (_this2.props.ckeditorCustomConfig) {
                        editor.config = _this2.props.ckeditorCustomConfig;
                    }
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
            var newValue = e.target.value;
            if (this.props.onChange && isString(newValue) && this.props.value !== newValue) {
                this.props.onChange(newValue);
            }
        }
    }, {
        key: 'onEditorChange',
        value: function onEditorChange(e) {
            var newValue = e.editor.getData();
            if (this.props.onChange && isString(newValue) && this.props.value !== newValue) {
                this.props.onChange(newValue);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            var _this3 = this;

            var _props = this.props,
                type = _props.type,
                name = _props.name,
                label = _props.label,
                placeholder = _props.placeholder,
                value = _props.value,
                prefix = _props.prefix,
                suffix = _props.suffix,
                align = _props.align,
                disabled = _props.disabled,
                other = _objectWithoutProperties(_props, ['type', 'name', 'label', 'placeholder', 'value', 'prefix', 'suffix', 'align', 'disabled']);

            var defaultValue = TextField.parse(value);

            var fieldClassNames = classNames(_defineProperty({
                'field-text': true,
                'form-control': true
            }, 'text-' + align, align !== null));

            var field = null;
            if (type === 'textarea') {
                field = React.createElement('textarea', { className: 'field-textarea form-control', name: name, value: defaultValue, onChange: this.onChange, disabled: disabled });
            } else if (type === 'editor') {
                field = React.createElement(
                    'div',
                    _extends({ className: 'editor' }, other),
                    React.createElement('textarea', { id: 'editor', className: 'field-editor', name: 'editor', ref: function ref(el) {
                            _this3.editor = el;
                        } }),
                    React.createElement('input', { type: 'hidden', name: name, value: defaultValue })
                );
            } else {
                field = React.createElement('input', {
                    id: name,
                    type: type,
                    className: fieldClassNames,
                    name: name,
                    value: defaultValue,
                    placeholder: placeholder,
                    disabled: disabled,
                    onChange: this.onChange
                });
            }

            var inputGroup = null;
            if (prefix || suffix) {
                var fixClassNames = classNames({
                    'input-group-addon': isString(suffix),
                    'input-group-addon input-group-addon-small': !isString(suffix)
                });

                var renderedPrefix = prefix ? React.createElement(
                    'span',
                    { className: fixClassNames },
                    prefix
                ) : null;

                var renderedSuffix = suffix ? React.createElement(
                    'span',
                    { className: fixClassNames },
                    suffix
                ) : null;

                var groupClassNames = classNames(_defineProperty({
                    'input-group': true,
                    'input-group-text': true
                }, 'input-group-' + type, true));

                inputGroup = React.createElement(
                    'div',
                    { className: groupClassNames },
                    renderedPrefix,
                    field,
                    renderedSuffix
                );
            } else {
                inputGroup = field;
            }

            return React.createElement(
                FormGroup,
                _extends({ className: 'form-group-text', name: name, label: label }, other),
                inputGroup
            );
        }
    }]);

    return TextField;
}(Component);

TextField.propTypes = propTypes;
TextField.defaultProps = defaultProps;

export default TextField;