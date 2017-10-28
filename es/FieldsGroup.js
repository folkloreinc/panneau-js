import _extends from 'babel-runtime/helpers/extends';
import _objectWithoutProperties from 'babel-runtime/helpers/objectWithoutProperties';
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import set from 'lodash/set';

import FormGroup from './FormGroup';
import FieldsCollection from './lib/FieldsCollection';

var propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.object]),
    errors: PropTypes.oneOfType([PropTypes.object]),
    fields: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    })),
    getFieldComponent: PropTypes.func,
    fieldsCollection: PropTypes.instanceOf(FieldsCollection),
    fieldsComponents: PropTypes.shape({}),
    renderNotFound: PropTypes.func,
    columns: PropTypes.number,
    collapsible: PropTypes.bool,
    collapsibleTypes: PropTypes.arrayOf(PropTypes.string),
    collapsed: PropTypes.bool,
    onChange: PropTypes.func
};

var defaultProps = {
    name: null,
    label: null,
    value: null,
    errors: null,
    fields: [],
    getFieldComponent: null,
    fieldsCollection: null,
    fieldsComponents: null,
    renderNotFound: null,
    columns: null,
    collapsible: false,
    collapsibleTypes: [],
    collapsed: false,
    onChange: null
};

var contextTypes = {
    fieldsCollection: PropTypes.instanceOf(FieldsCollection)
};

var FieldsGroup = function (_Component) {
    _inherits(FieldsGroup, _Component);

    function FieldsGroup(props) {
        _classCallCheck(this, FieldsGroup);

        var _this = _possibleConstructorReturn(this, (FieldsGroup.__proto__ || Object.getPrototypeOf(FieldsGroup)).call(this, props));

        _this.renderField = _this.renderField.bind(_this);
        return _this;
    }

    _createClass(FieldsGroup, [{
        key: 'onChange',
        value: function onChange(key, value) {
            var hasKey = typeof key !== 'undefined' && key !== null;
            var currentValue = this.props.value || {};
            var newValue = Object.assign({}, currentValue, !hasKey ? value : null);
            if (hasKey) {
                set(newValue, key, value);
            }
            if (this.props.onChange) {
                this.props.onChange(newValue);
            }
        }
    }, {
        key: 'getFieldComponent',
        value: function getFieldComponent(key) {
            var _props = this.props,
                fieldsComponents = _props.fieldsComponents,
                getFieldComponent = _props.getFieldComponent;

            var fieldsCollection = this.props.fieldsCollection || this.context.fieldsCollection || null;
            var normalizedKey = FieldsCollection.normalizeKey(key);

            if (getFieldComponent !== null) {
                return getFieldComponent(key);
            } else if (fieldsComponents !== null) {
                var fieldKey = Object.keys(fieldsComponents).find(function (k) {
                    return FieldsCollection.normalizeKey(k) === normalizedKey;
                });
                return typeof fieldKey !== 'undefined' && fieldKey !== null ? fieldsComponents[fieldKey] : null;
            } else if (fieldsCollection !== null) {
                return fieldsCollection.getComponent(key);
            } else if (fieldsCollection !== null) {
                return fieldsCollection.getComponent(key);
            }

            return normalizedKey.toLowerCase() === 'fields' ? FieldsGroup : null;
        }
    }, {
        key: 'renderNotFound',
        value: function renderNotFound(it, index) {
            var renderNotFound = this.props.renderNotFound;
            var type = it.type,
                name = it.name;


            if (renderNotFound !== null) {
                return this.renderNotFound(it, index);
            }

            return React.createElement(
                'div',
                null,
                'NOT FOUND: Field ',
                name,
                ' of type ',
                type
            );
        }
    }, {
        key: 'renderField',
        value: function renderField(it, index) {
            var _this2 = this;

            var _props2 = this.props,
                value = _props2.value,
                errors = _props2.errors,
                collapsibleTypes = _props2.collapsibleTypes;

            var type = it.type,
                name = it.name,
                hidden = it.hidden,
                defaultValue = it.defaultValue,
                props = _objectWithoutProperties(it, ['type', 'name', 'hidden', 'defaultValue']);

            var extraProps = it.props || {};

            if (hidden === true) {
                return null;
            }

            var FieldComponent = this.getFieldComponent(type);
            if (FieldComponent === null) {
                return this.renderNotFound(it, index);
            }

            var fieldDefaultValue = typeof defaultValue !== 'undefined' ? defaultValue : undefined;
            var fieldValue = value && name ? get(value, name, fieldDefaultValue) : value;
            var fieldErrors = errors && name ? get(errors, name, undefined) : errors;
            var fieldCollapsible = collapsibleTypes.indexOf(type) !== -1 || it.collapsible;
            var fieldCollapsed = it.collapsed || fieldCollapsible && typeof fieldValue === 'undefined';
            var key = '' + name + type + index + this.props.name;

            return React.createElement(FieldComponent, _extends({}, props, {
                collapsible: fieldCollapsible,
                collapsed: fieldCollapsed
            }, extraProps, {
                key: key,
                name: name,
                value: fieldValue,
                errors: fieldErrors,
                onChange: function onChange(val) {
                    _this2.onChange(name, val);
                }
            }));
        }
    }, {
        key: 'renderColumns',
        value: function renderColumns(fields, columns) {
            var _this3 = this;

            var remainingFields = [].concat(fields);
            var fieldsWithoutColumns = fields.reduce(function (total, field) {
                return typeof field.column === 'undefined' ? total + 1 : total;
            }, 0);
            var fieldsByColumn = Math.ceil(fieldsWithoutColumns / columns);
            var cols = [];

            var _loop = function _loop(colIndex) {
                var col = [];
                var colFields = remainingFields.filter(function (field) {
                    return typeof field.column !== 'undefined' && field.column === colIndex;
                });
                if (colFields.length > 0) {
                    colFields.forEach(function (colField) {
                        var index = fields.findIndex(function (field) {
                            return field === colField;
                        });
                        col.push(_this3.renderField(colField, index));
                        var remainingIndex = remainingFields.findIndex(function (field) {
                            return field === colField;
                        });
                        if (remainingIndex !== -1) {
                            remainingFields.splice(1, remainingIndex);
                        }
                    });
                } else {
                    for (var i = 0; i < fieldsByColumn; i += 1) {
                        var remainingIndex = remainingFields.findIndex(function (field) {
                            return typeof field.column === 'undefined';
                        });
                        if (remainingIndex !== -1) {
                            (function () {
                                var colField = remainingFields[remainingIndex];
                                var index = fields.findIndex(function (field) {
                                    return field === colField;
                                });
                                col.push(_this3.renderField(colField, index));
                                remainingFields.splice(1, remainingIndex);
                            })();
                        }
                    }
                }
                cols.push(React.createElement(
                    'div',
                    { className: 'col-sm-' + 12 / columns, key: 'col-' + colIndex },
                    col
                ));
            };

            for (var colIndex = 0; colIndex < columns; colIndex += 1) {
                _loop(colIndex);
            }

            return React.createElement(
                'div',
                { className: 'field-group' },
                React.createElement(
                    'div',
                    { className: 'row' },
                    cols
                )
            );
        }
    }, {
        key: 'renderFields',
        value: function renderFields(fields) {
            var columns = this.props.columns;

            if (columns !== null) {
                return this.renderColumns(fields, columns);
            }
            return React.createElement(
                'div',
                { className: 'field-group' },
                fields.map(this.renderField)
            );
        }
    }, {
        key: 'render',
        value: function render() {
            var _props3 = this.props,
                label = _props3.label,
                fields = _props3.fields,
                collapsible = _props3.collapsible,
                collapsed = _props3.collapsed;


            var fieldsGroup = this.renderFields(fields);

            return label !== null ? React.createElement(
                FormGroup,
                { label: label, collapsible: collapsible, collapsed: collapsed },
                fieldsGroup
            ) : fieldsGroup;
        }
    }]);

    return FieldsGroup;
}(Component);

FieldsGroup.propTypes = propTypes;
FieldsGroup.defaultProps = defaultProps;
FieldsGroup.contextTypes = contextTypes;

export default FieldsGroup;