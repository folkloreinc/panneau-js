import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import renderer from 'react-test-renderer';
/* eslint-enable import/no-extraneous-dependencies */
import FieldsGroupField from '../FieldsGroup';

test('match snapshot', () => {
    const component = renderer.create((
        <FieldsGroupField
            label="Label"
            value={{}}
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
