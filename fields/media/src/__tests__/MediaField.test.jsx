import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import MediaField from '../MediaField';

test('match snapshot', () => {
    const component = renderer.create((
        <MediaField
            label="Label"
            value="value"
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('value is in <input />', () => {
    const field = shallow(<MediaField value="test" />);
    expect(field.find('input').prop('value')).toEqual('test');

    const nullField = shallow(<MediaField value={null} />);
    expect(nullField.find('input').prop('value')).toEqual('');
});
