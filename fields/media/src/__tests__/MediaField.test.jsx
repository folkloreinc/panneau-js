import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import renderer from 'react-test-renderer';
/* eslint-enable import/no-extraneous-dependencies */
import MediaField from '../MediaField';
import MediaDocument from '../MediaDocument';

test('match snapshot', () => {
    const component = renderer.create((
        <MediaField
            label="Label"
            MediaComponent={MediaDocument}
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
