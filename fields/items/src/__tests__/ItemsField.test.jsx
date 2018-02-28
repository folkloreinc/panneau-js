import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import renderer from 'react-test-renderer';
/* eslint-enable import/no-extraneous-dependencies */
import ItemsField from '../ItemsField';

test('match snapshot', () => {
    const component = renderer.create((
        <ItemsField
            label="Label"
            value={[]}
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
