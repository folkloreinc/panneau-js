import _extends from 'babel-runtime/helpers/extends';
import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _createClass from 'babel-runtime/helpers/createClass';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import FormGroup from '../FormGroup';

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
    language: PropTypes.string,
    theme: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    editorProps: PropTypes.object, // eslint-disable-line
    isJson: PropTypes.bool,
    onChange: PropTypes.func
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
    _inherits(CodeField, _Component);

    _createClass(CodeField, null, [{
        key: 'parse',
        value: function parse(value) {
            if (typeof value === 'undefined' || value === null) {
                return value;
            }
            return isString(value) || isNumber(value) ? value : JSON.stringify(value, null, 4);
        }
    }]);

    function CodeField(props) {
        _classCallCheck(this, CodeField);

        var _this = _possibleConstructorReturn(this, (CodeField.__proto__ || Object.getPrototypeOf(CodeField)).call(this, props));

        _this.AceEditor = null;
        _this.brace = null;

        _this.onChange = _this.onChange.bind(_this);

        _this.state = {
            ready: false,
            textValue: props.language === 'json' && props.isJson ? CodeField.parse(props.value) : null
        };
        return _this;
    }

    _createClass(CodeField, [{
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
                props = _objectWithoutProperties(_props3, ['language', 'theme', 'value', 'isJson', 'width', 'height', 'editorProps']);

            var textValue = this.state.textValue;


            var val = language === 'json' && isJson ? textValue : CodeField.parse(value);

            var editorWidth = isNumber(width) ? width + 'px' : width;
            var editorHeight = isNumber(height) ? height + 'px' : height;

            var AceEditor = this.AceEditor;

            return React.createElement(AceEditor, _extends({}, props, {
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
                other = _objectWithoutProperties(_props4, ['name', 'label']);

            var ready = this.state.ready;


            return React.createElement(
                FormGroup,
                _extends({ className: styles.formGroup + ' form-group-code', name: name, label: label }, other),
                ready ? this.renderField() : null
            );
        }
    }]);

    return CodeField;
}(Component);

CodeField.propTypes = propTypes;
CodeField.defaultProps = defaultProps;

export default CodeField;