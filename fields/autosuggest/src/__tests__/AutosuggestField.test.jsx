import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import AutosuggestField from '../AutosuggestField';

test('match snapshot', () => {
    const component = renderer.create((
        <AutosuggestField
            label="Label"
            value="value"
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('value is in <input />', () => {
    const field = shallow(<AutosuggestField value="test" />);
    expect(field.find('input').prop('value')).toEqual('test');

    const nullField = shallow(<AutosuggestField value={null} />);
    expect(nullField.find('input').prop('value')).toEqual('');
});
