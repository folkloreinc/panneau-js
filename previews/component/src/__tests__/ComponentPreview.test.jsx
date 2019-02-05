/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import ComponentPreview from '../ComponentPreview';

test('match snapshot', () => {
    const component = renderer.create((
        <ComponentPreview

        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
