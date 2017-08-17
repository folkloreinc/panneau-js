import React from 'react';
import renderer from 'react-test-renderer';
import TextField from '../TextField';

test('TextField render a <div />', () => {
    const component = renderer.create(
        <TextField />,
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
