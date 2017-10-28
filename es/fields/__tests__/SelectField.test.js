import React from 'react';
import renderer from 'react-test-renderer';
import SelectField from '../SelectField';

test('SelectField render a <div />', function () {
    var component = renderer.create(React.createElement(SelectField, null));
    var tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});