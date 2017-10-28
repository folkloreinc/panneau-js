'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _addonActions = require('@storybook/addon-actions');

var _storiesOf = require('../../.storybook/storiesOf');

var _storiesOf2 = _interopRequireDefault(_storiesOf);

var _KeepValue = require('../../.storybook/KeepValue');

var _KeepValue2 = _interopRequireDefault(_KeepValue);

var _FieldsGroup = require('../FieldsGroup');

var _FieldsGroup2 = _interopRequireDefault(_FieldsGroup);

var _withFieldsCollection = require('../withFieldsCollection');

var _withFieldsCollection2 = _interopRequireDefault(_withFieldsCollection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-line import/no-extraneous-dependencies

var FieldsGroupWithCollection = (0, _withFieldsCollection2.default)(_FieldsGroup2.default);

var fields = [{
    type: 'text',
    name: 'text',
    label: 'Text field'
}, {
    type: 'select',
    name: 'select',
    label: 'Select field'
}, {
    type: 'color',
    name: 'color',
    label: 'Color field'
}, {
    type: 'code',
    name: 'code',
    label: 'Code field'
}];

(0, _storiesOf2.default)('FieldsGroup', module).add('simple', function () {
    return _react2.default.createElement(
        _KeepValue2.default,
        null,
        _react2.default.createElement(FieldsGroupWithCollection, {
            fields: fields,
            onChange: (0, _addonActions.action)('change')
        })
    );
});