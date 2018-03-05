import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import ItemField from '../ItemField';

test('match snapshot', () => {
    const component = renderer.create((
        <ItemField
            label="Label"
            value="value"
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('value is in <input />', () => {
    const field = shallow(<ItemField value="test" />);
    expect(field.find('input').prop('value')).toEqual('test');

    const nullField = shallow(<ItemField value={null} />);
    expect(nullField.find('input').prop('value')).toEqual('');
});
