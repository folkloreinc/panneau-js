import React from 'react';
import renderer from 'react-test-renderer';
import Field from '../Field';

test('match snapshot', () => {
    const component = renderer.create((
        <Field
            label="Label"
            value="value"
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
