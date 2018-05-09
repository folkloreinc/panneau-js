/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import renderer from 'react-test-renderer';
import ItemField from '../ItemField';

test('match snapshot', () => {
    const component = renderer.create((
        <ItemField
            label="Label"
            value={{}}
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
