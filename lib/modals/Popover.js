'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _OutsideClickHandler = require('../partials/OutsideClickHandler');

var _OutsideClickHandler2 = _interopRequireDefault(_OutsideClickHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var styles = {
    'popover': 'panneau-popover-popover'
};


var propTypes = {
    children: _propTypes2.default.node.isRequired,
    closable: _propTypes2.default.bool,
    className: _propTypes2.default.string,
    onClose: _propTypes2.default.func
};

var defaultProps = {
    closable: true,
    className: null,
    onClose: null
};

var Popover = function Popover(_ref) {
    var _classNames;

    var closable = _ref.closable,
        className = _ref.className,
        children = _ref.children,
        onClose = _ref.onClose,
        other = (0, _objectWithoutProperties3.default)(_ref, ['closable', 'className', 'children', 'onClose']);

    var popoverClassName = (0, _classnames2.default)((_classNames = {}, (0, _defineProperty3.default)(_classNames, styles.popover, true), (0, _defineProperty3.default)(_classNames, className, className !== null), _classNames));
    if (closable) {
        return _react2.default.createElement(
            'div',
            (0, _extends3.default)({ className: popoverClassName }, other),
            _react2.default.createElement(
                _OutsideClickHandler2.default,
                { onOutsideClick: onClose },
                children
            )
        );
    }
    return _react2.default.createElement(
        'div',
        (0, _extends3.default)({ className: popoverClassName }, other),
        children
    );
};

Popover.propTypes = propTypes;
Popover.defaultProps = defaultProps;

exports.default = Popover;