import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React from 'react';
import PropTypes from 'prop-types';

// import { forbidExtraProps } from 'airbnb-prop-types'; // TODO: add to propTypes; semver-major
import { addEventListener, removeEventListener } from 'consolidated-events';

var propTypes = {
    children: PropTypes.node,
    onOutsideClick: PropTypes.func
};

var defaultProps = {
    children: React.createElement('span', null),
    onOutsideClick: function onOutsideClick() {}
};

var OutsideClickHandler = function (_React$Component) {
    _inherits(OutsideClickHandler, _React$Component);

    function OutsideClickHandler() {
        var _ref;

        _classCallCheck(this, OutsideClickHandler);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var _this = _possibleConstructorReturn(this, (_ref = OutsideClickHandler.__proto__ || Object.getPrototypeOf(OutsideClickHandler)).call.apply(_ref, [this].concat(args)));

        _this.onOutsideClick = _this.onOutsideClick.bind(_this);
        _this.setChildNodeRef = _this.setChildNodeRef.bind(_this);
        return _this;
    }

    _createClass(OutsideClickHandler, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            // `capture` flag is set to true so that a `stopPropagation` in the children
            // will not prevent all outside click handlers from firing - maja
            this.clickHandle = addEventListener(document, 'click', this.onOutsideClick, { capture: true });
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if (this.clickHandle) {
                removeEventListener(this.clickHandle);
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
            return React.createElement(
                'div',
                { ref: this.setChildNodeRef },
                this.props.children
            );
        }
    }]);

    return OutsideClickHandler;
}(React.Component);

export default OutsideClickHandler;


OutsideClickHandler.propTypes = propTypes;
OutsideClickHandler.defaultProps = defaultProps;