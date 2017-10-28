import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import TextField from '../TextField';

test('match snapshot', () => {
    const component = renderer.create((
        <TextField
            label="Label"
            value="value"
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('value is in <input />', () => {
    const field = shallow(<TextField value="test" />);
    expect(field.find('input').prop('value')).toEqual('test');

    const nullField = shallow(<TextField value={null} />);
    expect(nullField.find('input').prop('value')).toEqual('');
});

test('input change trigger onChange with value', () => {
    const onChange = sinon.spy();
    const wrapper = mount(<TextField value="test" onChange={onChange} />);
    wrapper.find('input').simulate('change');
    expect(onChange.calledOnce).toEqual(true);
    expect(onChange.calledWith('test')).toEqual(true);
});

test('label is passed to <FormGroup />', () => {
    const field = shallow(<TextField label="test" />);
    expect(field.find('FormGroup').prop('label')).toEqual('test');
});
