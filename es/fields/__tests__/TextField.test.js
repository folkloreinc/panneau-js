import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import TextField from '../TextField';

test('match snapshot', function () {
    var component = renderer.create(React.createElement(TextField, {
        label: 'Label',
        value: 'value'
    }));
    var tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('value is in <input />', function () {
    var field = shallow(React.createElement(TextField, { value: 'test' }));
    expect(field.find('input').prop('value')).toEqual('test');
});

test('simulates change event', function () {
    var onChange = sinon.spy();
    var wrapper = mount(React.createElement(TextField, { value: 'test', onChange: onChange }));
    wrapper.find('input').simulate('change');
    expect(onChange.calledOnce).toEqual(true);
    expect(onChange.calledWith('test')).toEqual(true);
});

test('label is passed to <FormGroup />', function () {
    var field = shallow(React.createElement(TextField, { label: 'test' }));
    expect(field.find('FormGroup').prop('label')).toEqual('test');
});