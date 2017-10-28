'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

exports.default = withFieldsCollection;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _hoistNonReactStatics = require('hoist-non-react-statics');

var _hoistNonReactStatics2 = _interopRequireDefault(_hoistNonReactStatics);

var _collection = require('./fields/collection');

var _collection2 = _interopRequireDefault(_collection);

var _FieldsCollection = require('./lib/FieldsCollection');

var _FieldsCollection2 = _interopRequireDefault(_FieldsCollection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

var childContextTypes = {
    fieldsCollection: _propTypes2.default.instanceOf(_FieldsCollection2.default)
};

function withFieldsCollection(WrappedComponent, fieldsCollection, opts) {
    var options = Object.assign({
        withRef: false
    }, opts);

    var WithFieldsCollection = function (_Component) {
        (0, _inherits3.default)(WithFieldsCollection, _Component);
        (0, _createClass3.default)(WithFieldsCollection, null, [{
            key: 'getWrappedInstance',
            value: function getWrappedInstance() {
                (0, _invariant2.default)(options.withRef, 'To access the wrapped instance, you need to specify `{ withRef: true }` as the third argument of the withFieldsCollection() call.');

                return this.wrappedInstance;
            }
        }]);

        function WithFieldsCollection(props) {
            (0, _classCallCheck3.default)(this, WithFieldsCollection);

            var _this = (0, _possibleConstructorReturn3.default)(this, (WithFieldsCollection.__proto__ || Object.getPrototypeOf(WithFieldsCollection)).call(this, props));

            _this.wrappedInstance = null;
            return _this;
        }

        (0, _createClass3.default)(WithFieldsCollection, [{
            key: 'getChildContext',
            value: function getChildContext() {
                return {
                    fieldsCollection: fieldsCollection || _collection2.default
                };
            }
        }, {
            key: 'render',
            value: function render() {
                var _this2 = this;

                var props = Object.assign({}, this.props);
                if (options.withRef) {
                    props.ref = function (c) {
                        _this2.wrappedInstance = c;
                    };
                }

                return _react2.default.createElement(WrappedComponent, props);
            }
        }]);
        return WithFieldsCollection;
    }(_react.Component);

    WithFieldsCollection.childContextTypes = childContextTypes;
    WithFieldsCollection.displayName = 'withFieldsCollection(' + getDisplayName(WrappedComponent) + ')';
    WithFieldsCollection.WrappedComponent = WrappedComponent;

    var WithFieldsCollectionComponent = (0, _hoistNonReactStatics2.default)(WithFieldsCollection, WrappedComponent);

    return WithFieldsCollectionComponent;
}