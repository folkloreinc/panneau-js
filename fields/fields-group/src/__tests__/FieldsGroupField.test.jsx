import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import FieldsGroupField from '../FieldsGroupField';

test('match snapshot', () => {
    const component = renderer.create((
        <FieldsGroupField
            label="Label"
            value="value"
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('value is in <input />', () => {
    const field = shallow(<FieldsGroupField value="test" />);
    expect(field.find('input').prop('value')).toEqual('test');

    const nullField = shallow(<FieldsGroupField value={null} />);
    expect(nullField.find('input').prop('value')).toEqual('');
});
