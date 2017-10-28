import React from 'react';
import renderer from 'react-test-renderer';
import SelectField from '../src/SelectField';

test('SelectField render a <div />', () => {
    const component = renderer.create(<SelectField />);
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
