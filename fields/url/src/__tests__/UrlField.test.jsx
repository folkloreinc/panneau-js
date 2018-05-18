/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import renderer from 'react-test-renderer';
// import { shallow } from 'enzyme';
// import sinon from 'sinon';
import UrlField from '../UrlField';

test('match snapshot', () => {
    const component = renderer.create((
        <UrlField
            label="Label"
            value="https://google.com"
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
