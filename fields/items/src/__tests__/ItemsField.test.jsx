import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import ItemsField from '../ItemsField';

test('match snapshot', () => {
    const component = renderer.create((
        <ItemsField
            label="Label"
            value="value"
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('value is in <input />', () => {
    const field = shallow(<ItemsField value="test" />);
    expect(field.find('input').prop('value')).toEqual('test');

    const nullField = shallow(<ItemsField value={null} />);
    expect(nullField.find('input').prop('value')).toEqual('');
});
