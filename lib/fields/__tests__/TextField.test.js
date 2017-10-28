'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactTestRenderer = require('react-test-renderer');

var _reactTestRenderer2 = _interopRequireDefault(_reactTestRenderer);

var _enzyme = require('enzyme');

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _TextField = require('../TextField');

var _TextField2 = _interopRequireDefault(_TextField);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

test('match snapshot', function () {
    var component = _reactTestRenderer2.default.create(_react2.default.createElement(_TextField2.default, {
        label: 'Label',
        value: 'value'
    }));
    var tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('value is in <input />', function () {
    var field = (0, _enzyme.shallow)(_react2.default.createElement(_TextField2.default, { value: 'test' }));
    expect(field.find('input').prop('value')).toEqual('test');
});

test('simulates change event', function () {
    var onChange = _sinon2.default.spy();
    var wrapper = (0, _enzyme.mount)(_react2.default.createElement(_TextField2.default, { value: 'test', onChange: onChange }));
    wrapper.find('input').simulate('change');
    expect(onChange.calledOnce).toEqual(true);
    expect(onChange.calledWith('test')).toEqual(true);
});

test('label is passed to <FormGroup />', function () {
    var field = (0, _enzyme.shallow)(_react2.default.createElement(_TextField2.default, { label: 'test' }));
    expect(field.find('FormGroup').prop('label')).toEqual('test');
});