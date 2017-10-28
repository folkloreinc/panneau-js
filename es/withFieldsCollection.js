import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _createClass from 'babel-runtime/helpers/createClass';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import invariant from 'invariant';
import hoistStatics from 'hoist-non-react-statics';

import collection from './fields/collection';
import FieldsCollection from './lib/FieldsCollection';

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

var childContextTypes = {
    fieldsCollection: PropTypes.instanceOf(FieldsCollection)
};

export default function withFieldsCollection(WrappedComponent, fieldsCollection, opts) {
    var options = Object.assign({
        withRef: false
    }, opts);

    var WithFieldsCollection = function (_Component) {
        _inherits(WithFieldsCollection, _Component);

        _createClass(WithFieldsCollection, null, [{
            key: 'getWrappedInstance',
            value: function getWrappedInstance() {
                invariant(options.withRef, 'To access the wrapped instance, you need to specify `{ withRef: true }` as the third argument of the withFieldsCollection() call.');

                return this.wrappedInstance;
            }
        }]);

        function WithFieldsCollection(props) {
            _classCallCheck(this, WithFieldsCollection);

            var _this = _possibleConstructorReturn(this, (WithFieldsCollection.__proto__ || Object.getPrototypeOf(WithFieldsCollection)).call(this, props));

            _this.wrappedInstance = null;
            return _this;
        }

        _createClass(WithFieldsCollection, [{
            key: 'getChildContext',
            value: function getChildContext() {
                return {
                    fieldsCollection: fieldsCollection || collection
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

                return React.createElement(WrappedComponent, props);
            }
        }]);

        return WithFieldsCollection;
    }(Component);

    WithFieldsCollection.childContextTypes = childContextTypes;
    WithFieldsCollection.displayName = 'withFieldsCollection(' + getDisplayName(WrappedComponent) + ')';
    WithFieldsCollection.WrappedComponent = WrappedComponent;

    var WithFieldsCollectionComponent = hoistStatics(WithFieldsCollection, WrappedComponent);

    return WithFieldsCollectionComponent;
}