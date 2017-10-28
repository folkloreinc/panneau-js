'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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

var _consolidatedEvents = require('consolidated-events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var propTypes = {
    children: _propTypes2.default.node,
    onOutsideClick: _propTypes2.default.func
};

// import { forbidExtraProps } from 'airbnb-prop-types'; // TODO: add to propTypes; semver-major


var defaultProps = {
    children: _react2.default.createElement('span', null),
    onOutsideClick: function onOutsideClick() {}
};

var OutsideClickHandler = function (_React$Component) {
    (0, _inherits3.default)(OutsideClickHandler, _React$Component);

    function OutsideClickHandler() {
        var _ref;

        (0, _classCallCheck3.default)(this, OutsideClickHandler);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var _this = (0, _possibleConstructorReturn3.default)(this, (_ref = OutsideClickHandler.__proto__ || Object.getPrototypeOf(OutsideClickHandler)).call.apply(_ref, [this].concat(args)));

        _this.onOutsideClick = _this.onOutsideClick.bind(_this);
        _this.setChildNodeRef = _this.setChildNodeRef.bind(_this);
        return _this;
    }

    (0, _createClass3.default)(OutsideClickHandler, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            // `capture` flag is set to true so that a `stopPropagation` in the children
            // will not prevent all outside click handlers from firing - maja
            this.clickHandle = (0, _consolidatedEvents.addEventListener)(document, 'click', this.onOutsideClick, { capture: true });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.clickHandle) {
                (0, _consolidatedEvents.removeEventListener)(this.clickHandle);
            }
        }
    }, {
        key: 'onOutsideClick',
        value: function onOutsideClick(e) {
            var onOutsideClick = this.props.onOutsideClick;
            var childNode = this.childNode;

            var isDescendantOfRoot = childNode && childNode.contains(e.target);
            if (!isDescendantOfRoot) {
                onOutsideClick(e);
            }
        }
    }, {
        key: 'setChildNodeRef',
        value: function setChildNodeRef(ref) {
            this.childNode = ref;
        }
    }, {
        key: 'render',
        value: function render() {
            return _react2.default.createElement(
                'div',
                { ref: this.setChildNodeRef },
                this.props.children
            );
        }
    }]);
    return OutsideClickHandler;
}(_react2.default.Component);

exports.default = OutsideClickHandler;


OutsideClickHandler.propTypes = propTypes;
OutsideClickHandler.defaultProps = defaultProps;