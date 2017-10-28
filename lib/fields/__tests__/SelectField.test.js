'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactTestRenderer = require('react-test-renderer');

var _reactTestRenderer2 = _interopRequireDefault(_reactTestRenderer);

var _SelectField = require('../SelectField');

var _SelectField2 = _interopRequireDefault(_SelectField);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

test('SelectField render a <div />', function () {
    var component = _reactTestRenderer2.default.create(_react2.default.createElement(_SelectField2.default, null));
    var tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});