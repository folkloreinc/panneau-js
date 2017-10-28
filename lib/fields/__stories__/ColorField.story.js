'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _addonActions = require('@storybook/addon-actions');

var _storiesOf = require('../../../.storybook/storiesOf');

var _storiesOf2 = _interopRequireDefault(_storiesOf);

var _ColorField = require('../ColorField');

var _ColorField2 = _interopRequireDefault(_ColorField);

var _KeepValue = require('../../../.storybook/KeepValue');

var _KeepValue2 = _interopRequireDefault(_KeepValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storiesOf2.default)('Fields/Color', module).add('simple', function () {
    return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
            _KeepValue2.default,
            null,
            _react2.default.createElement(_ColorField2.default, {
                label: 'Label',
                onChange: (0, _addonActions.action)('change')
            })
        ),
        _react2.default.createElement(
            _KeepValue2.default,
            null,
            _react2.default.createElement(_ColorField2.default, {
                label: 'Disabled',
                value: '#FFCC00',
                disabled: true,
                onChange: (0, _addonActions.action)('change')
            })
        )
    );
}).add('with input', function () {
    return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
            _KeepValue2.default,
            null,
            _react2.default.createElement(_ColorField2.default, {
                label: 'Label',
                withInput: true,
                onChange: (0, _addonActions.action)('change')
            })
        )
    );
}); // eslint-disable-line import/no-extraneous-dependencies