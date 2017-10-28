'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _addonActions = require('@storybook/addon-actions');

var _storiesOf = require('../../../.storybook/storiesOf');

var _storiesOf2 = _interopRequireDefault(_storiesOf);

var _KeepValue = require('../../../.storybook/KeepValue');

var _KeepValue2 = _interopRequireDefault(_KeepValue);

var _CodeField = require('../CodeField');

var _CodeField2 = _interopRequireDefault(_CodeField);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var value = '// This is code'; // eslint-disable-line import/no-extraneous-dependencies

var valueHtml = '<div class="a-class">\n    <img src="http://placehold.it/300x300" />\n</div>\n';

var valueJson = {
    test: 'An object'
};

(0, _storiesOf2.default)('Fields/Code', module).add('simple', function () {
    return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
            _KeepValue2.default,
            null,
            _react2.default.createElement(_CodeField2.default, {
                label: 'Label',
                height: 100,
                value: value,
                onChange: (0, _addonActions.action)('change')
            })
        ),
        _react2.default.createElement(
            _KeepValue2.default,
            null,
            _react2.default.createElement(_CodeField2.default, {
                label: 'HTML',
                language: 'html',
                height: 100,
                value: valueHtml,
                onChange: (0, _addonActions.action)('change')
            })
        ),
        _react2.default.createElement(
            _KeepValue2.default,
            null,
            _react2.default.createElement(_CodeField2.default, {
                label: 'JSON with Monokai theme',
                language: 'json',
                theme: 'monokai',
                height: 100,
                value: valueJson,
                isJson: true,
                onChange: (0, _addonActions.action)('change')
            })
        )
    );
});