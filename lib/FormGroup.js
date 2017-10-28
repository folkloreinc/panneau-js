'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _isString = require('lodash/isString');

var _isString2 = _interopRequireDefault(_isString);

var _reactMarkdown = require('react-markdown');

var _reactMarkdown2 = _interopRequireDefault(_reactMarkdown);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var propTypes = {
    children: _propTypes2.default.node,

    className: _propTypes2.default.string,
    name: _propTypes2.default.string,
    label: _propTypes2.default.string,
    errors: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.array]),
    helpText: _propTypes2.default.string,

    large: _propTypes2.default.bool,
    small: _propTypes2.default.bool,
    inline: _propTypes2.default.bool,

    collapsible: _propTypes2.default.bool,
    collapsed: _propTypes2.default.bool,
    inputOnly: _propTypes2.default.bool
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
    (0, _inherits3.default)(FormGroup, _Component);

    function FormGroup(props) {
        (0, _classCallCheck3.default)(this, FormGroup);

        var _this = (0, _possibleConstructorReturn3.default)(this, (FormGroup.__proto__ || Object.getPrototypeOf(FormGroup)).call(this, props));

        _this.onCollapseChange = _this.onCollapseChange.bind(_this);
        _this.renderError = _this.renderError.bind(_this);

        _this.state = {
            collapsed: _this.props.collapsed
        };
        return _this;
    }

    (0, _createClass3.default)(FormGroup, [{
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
            var items = (0, _isString2.default)(errors) ? [errors] : errors;
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
            return _react2.default.createElement(
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
            return _react2.default.createElement(
                'div',
                { className: 'help-block' },
                _react2.default.createElement(_reactMarkdown2.default, {
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


            var caret = _react2.default.createElement(
                'span',
                { className: this.state.collapsed ? 'dropright' : 'dropdown' },
                _react2.default.createElement('span', { className: 'caret up' })
            );

            var link = collapsible ? _react2.default.createElement(
                'button',
                { className: 'no-btn-style no-link', onClick: this.onCollapseChange },
                caret,
                ' ',
                label
            ) : label;

            var labelClasses = (0, _classnames2.default)({
                'control-label': true,
                'smaller-text': small
            });

            var renderedLabel = large ? _react2.default.createElement(
                'h4',
                { className: 'control-label' },
                link
            ) : _react2.default.createElement(
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
                return Object.assign({}, obj, (0, _defineProperty3.default)({}, key, true));
            }, {}) : null;
            var formGroupClassNames = (0, _classnames2.default)(Object.assign({
                'form-group': true,
                'form-group-collapsible': collapsible,
                'has-error': errors && errors.length,
                'has-padding-bottom': inline
            }, customClassNames));

            var formGroupInnerClassNames = (0, _classnames2.default)({
                'form-group-inner': true,
                'form-group-collapsible-inner': collapsible
            });

            var innerStyle = {
                display: this.state.collapsed ? 'none' : 'block'
            };

            if (inline) {
                return _react2.default.createElement(
                    'div',
                    { className: formGroupClassNames },
                    _react2.default.createElement(
                        'div',
                        { className: 'table-full table-form-height' },
                        _react2.default.createElement(
                            'div',
                            { className: 'table-row' },
                            _react2.default.createElement(
                                'div',
                                { className: 'table-cell-centered left' },
                                this.renderLabel()
                            ),
                            _react2.default.createElement(
                                'div',
                                { className: 'table-cell-centered right' },
                                _react2.default.createElement(
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
            return _react2.default.createElement(
                'div',
                { className: formGroupClassNames },
                this.renderLabel(),
                !this.state.collapsed ? _react2.default.createElement(
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
}(_react.Component);

FormGroup.propTypes = propTypes;
FormGroup.defaultProps = defaultProps;

exports.default = FormGroup;