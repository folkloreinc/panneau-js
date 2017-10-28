'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _addonActions = require('@storybook/addon-actions');

var _storiesOf = require('../../../.storybook/storiesOf');

var _storiesOf2 = _interopRequireDefault(_storiesOf);

var _SelectField = require('../SelectField');

var _SelectField2 = _interopRequireDefault(_SelectField);

var _KeepValue = require('../../../.storybook/KeepValue');

var _KeepValue2 = _interopRequireDefault(_KeepValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var options = [{
    value: 1,
    label: 'Option 1'
}, {
    value: 2,
    label: 'Option 2'
}, {
    value: 3,
    label: 'Option 3'
}]; // eslint-disable-line import/no-extraneous-dependencies

(0, _storiesOf2.default)('Fields/Select', module).add('simple', function () {
    return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
            _KeepValue2.default,
            null,
            _react2.default.createElement(_SelectField2.default, {
                label: 'Label',
                options: options,
                value: 3,
                onChange: (0, _addonActions.action)('change')
            })
        ),
        _react2.default.createElement(
            _KeepValue2.default,
            null,
            _react2.default.createElement(_SelectField2.default, {
                label: 'Not clearable',
                options: options,
                clearable: false,
                addEmptyOption: true,
                value: 2,
                onChange: (0, _addonActions.action)('change')
            })
        ),
        _react2.default.createElement(
            _KeepValue2.default,
            null,
            _react2.default.createElement(_SelectField2.default, {
                label: 'Cannot be empty',
                options: options,
                canBeEmpty: false,
                onChange: (0, _addonActions.action)('change')
            })
        )
    );
}).add('multiple', function () {
    return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
            _KeepValue2.default,
            null,
            _react2.default.createElement(_SelectField2.default, {
                label: 'Multiple',
                options: options,
                multiple: true,
                onChange: (0, _addonActions.action)('change')
            })
        ),
        _react2.default.createElement(
            _KeepValue2.default,
            null,
            _react2.default.createElement(_SelectField2.default, {
                label: 'Multiple and creatable',
                options: options,
                multiple: true,
                creatable: true,
                onChange: (0, _addonActions.action)('change')
            })
        )
    );
});