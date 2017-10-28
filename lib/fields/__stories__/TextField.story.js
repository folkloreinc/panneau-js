'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _addonActions = require('@storybook/addon-actions');

var _storiesOf = require('../../../.storybook/storiesOf');

var _storiesOf2 = _interopRequireDefault(_storiesOf);

var _TextField = require('../TextField');

var _TextField2 = _interopRequireDefault(_TextField);

var _KeepValue = require('../../../.storybook/KeepValue');

var _KeepValue2 = _interopRequireDefault(_KeepValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _storiesOf2.default)('Fields/Text', module).add('simple', function () {
    return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
            _KeepValue2.default,
            null,
            _react2.default.createElement(_TextField2.default, {
                label: 'Label',
                helpText: 'This is an help text',
                placeholder: 'This is a placeholder...',
                onChange: (0, _addonActions.action)('change')
            })
        ),
        _react2.default.createElement(
            _KeepValue2.default,
            null,
            _react2.default.createElement(_TextField2.default, {
                label: 'Disabled',
                disabled: true,
                onChange: (0, _addonActions.action)('change')
            })
        )
    );
}).add('with suffix and prefix', function () {
    return _react2.default.createElement(_TextField2.default, {
        label: 'Label',
        helpText: 'This is an help text',
        placeholder: '0.00',
        prefix: 'Total',
        suffix: '$',
        align: 'right',
        onChange: (0, _addonActions.action)('change')
    });
}).add('other field types', function () {
    return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
            _KeepValue2.default,
            null,
            _react2.default.createElement(_TextField2.default, {
                label: 'Textarea',
                type: 'textarea',
                onChange: (0, _addonActions.action)('change')
            })
        ),
        _react2.default.createElement(
            'form',
            null,
            _react2.default.createElement(
                _KeepValue2.default,
                null,
                _react2.default.createElement(_TextField2.default, {
                    label: 'Editor',
                    type: 'editor',
                    onChange: (0, _addonActions.action)('change')
                })
            )
        )
    );
}); // eslint-disable-line import/no-extraneous-dependencies