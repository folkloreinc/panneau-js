import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import <%= componentName %> from '../<%= componentName %>';

test('match snapshot', () => {
    const component = renderer.create((
        <<%= componentName %>
            label="Label"
            value="value"
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});

test('value is in <input />', () => {
    const field = shallow(<<%= componentName %> value="test" />);
    expect(field.find('input').prop('value')).toEqual('test');

    const nullField = shallow(<<%= componentName %> value={null} />);
    expect(nullField.find('input').prop('value')).toEqual('');
});
