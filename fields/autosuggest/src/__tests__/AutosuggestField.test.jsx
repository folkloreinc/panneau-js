/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import renderer from 'react-test-renderer';
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
