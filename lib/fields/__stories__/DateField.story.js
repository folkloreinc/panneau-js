'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _addonActions = require('@storybook/addon-actions');

var _storiesOf = require('../../../.storybook/storiesOf');

var _storiesOf2 = _interopRequireDefault(_storiesOf);

var _DateField = require('../DateField');

var _DateField2 = _interopRequireDefault(_DateField);

var _KeepValue = require('../../../.storybook/KeepValue');

var _KeepValue2 = _interopRequireDefault(_KeepValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storiesOf2.default)('Fields/Date', module).add('simple', function () {
    return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
            _KeepValue2.default,
            null,
            _react2.default.createElement(_DateField2.default, {
                label: 'Label',
                onChange: (0, _addonActions.action)('change')
            })
        )
    );
}).add('range', function () {
    return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
            _KeepValue2.default,
            null,
            _react2.default.createElement(_DateField2.default, {
                label: 'Label',
                type: 'daterange',
                onChange: (0, _addonActions.action)('change')
            })
        )
    );
}); // eslint-disable-line import/no-extraneous-dependencies