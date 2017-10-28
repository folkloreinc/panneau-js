import _defineProperty from 'babel-runtime/helpers/defineProperty';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import isString from 'lodash/isString';
import ReactMarkdown from 'react-markdown';

var propTypes = {
    children: PropTypes.node,

    className: PropTypes.string,
    name: PropTypes.string,
    label: PropTypes.string,
    errors: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    helpText: PropTypes.string,

    large: PropTypes.bool,
    small: PropTypes.bool,
    inline: PropTypes.bool,

    collapsible: PropTypes.bool,
    collapsed: PropTypes.bool,
    inputOnly: PropTypes.bool
};

var defaultProps = {
    children: null,

    className: 'text',
    name: null,
    label: null,
    errors: [],
    helpText: null,

    large: false,
    small: false,
    inline: false,

    collapsible: false,
    collapsed: false,
    inputOnly: false
};

var FormGroup = function (_Component) {
    _inherits(FormGroup, _Component);

    function FormGroup(props) {
        _classCallCheck(this, FormGroup);

        var _this = _possibleConstructorReturn(this, (FormGroup.__proto__ || Object.getPrototypeOf(FormGroup)).call(this, props));

        _this.onCollapseChange = _this.onCollapseChange.bind(_this);
        _this.renderError = _this.renderError.bind(_this);

        _this.state = {
            collapsed: _this.props.collapsed
        };
        return _this;
    }

    _createClass(FormGroup, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps() {}
    }, {
        key: 'onCollapseChange',
        value: function onCollapseChange(e) {
            e.preventDefault();
            this.setState({
                collapsed: !this.state.collapsed
            });
        }
    }, {
        key: 'renderErrors',
        value: function renderErrors() {
            var errors = this.props.errors;

            if (!errors || errors.length < 1) {
                return null;
            }
            var items = isString(errors) ? [errors] : errors;
            return items.map(this.renderError);
        }

        // eslint-disable-next-line class-methods-use-this

    }, {
        key: 'renderError',
        value: function renderError(error, key) {
            if (!error || !error.length) {
                return null;
            }
            var errorKey = 'error_' + key;
            return React.createElement(
                'span',
                { key: errorKey, className: 'help-block' },
                error
            );
        }
    }, {
        key: 'renderHelp',
        value: function renderHelp() {
            var helpText = this.props.helpText;

            if (!helpText) {
                return null;
            }
            return React.createElement(
                'div',
                { className: 'help-block' },
                React.createElement(ReactMarkdown, {
                    source: helpText,
                    linkTarget: '_blank'
                })
            );
        }
    }, {
        key: 'renderLabel',
        value: function renderLabel() {
            var _props = this.props,
                name = _props.name,
                label = _props.label,
                large = _props.large,
                small = _props.small,
                collapsible = _props.collapsible;


            var caret = React.createElement(
                'span',
                { className: this.state.collapsed ? 'dropright' : 'dropdown' },
                React.createElement('span', { className: 'caret up' })
            );

            var link = collapsible ? React.createElement(
                'button',
                { className: 'no-btn-style no-link', onClick: this.onCollapseChange },
                caret,
                ' ',
                label
            ) : label;

            var labelClasses = classNames({
                'control-label': true,
                'smaller-text': small
            });

            var renderedLabel = large ? React.createElement(
                'h4',
                { className: 'control-label' },
                link
            ) : React.createElement(
                'label',
                { htmlFor: name, className: labelClasses },
                link
            );

            return link ? renderedLabel : null;
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props,
                inline = _props2.inline,
                children = _props2.children,
                className = _props2.className,
                errors = _props2.errors,
                inputOnly = _props2.inputOnly,
                collapsible = _props2.collapsible;


            if (inputOnly) {
                return children;
            }

            var customClassNames = className ? className.split(' ').reduce(function (obj, key) {
                return Object.assign({}, obj, _defineProperty({}, key, true));
            }, {}) : null;
            var formGroupClassNames = classNames(Object.assign({
                'form-group': true,
                'form-group-collapsible': collapsible,
                'has-error': errors && errors.length,
                'has-padding-bottom': inline
            }, customClassNames));

            var formGroupInnerClassNames = classNames({
                'form-group-inner': true,
                'form-group-collapsible-inner': collapsible
            });

            var innerStyle = {
                display: this.state.collapsed ? 'none' : 'block'
            };

            if (inline) {
                return React.createElement(
                    'div',
                    { className: formGroupClassNames },
                    React.createElement(
                        'div',
                        { className: 'table-full table-form-height' },
                        React.createElement(
                            'div',
                            { className: 'table-row' },
                            React.createElement(
                                'div',
                                { className: 'table-cell-centered left' },
                                this.renderLabel()
                            ),
                            React.createElement(
                                'div',
                                { className: 'table-cell-centered right' },
                                React.createElement(
                                    'div',
                                    { className: formGroupInnerClassNames, style: innerStyle },
                                    children
                                )
                            )
                        )
                    ),
                    this.renderHelp(),
                    this.renderErrors()
                );
            }
            return React.createElement(
                'div',
                { className: formGroupClassNames },
                this.renderLabel(),
                !this.state.collapsed ? React.createElement(
                    'div',
                    { className: formGroupInnerClassNames, style: innerStyle },
                    children,
                    this.renderHelp(),
                    this.renderErrors()
                ) : null
            );
        }
    }]);

    return FormGroup;
}(Component);

FormGroup.propTypes = propTypes;
FormGroup.defaultProps = defaultProps;

export default FormGroup;