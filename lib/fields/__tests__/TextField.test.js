import React from 'react';
import renderer from 'react-test-renderer';
import TextField from '../TextField';

test('TextField render a <div />', function () {
    var component = renderer.create(React.createElement(TextField, null));
    var tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});