import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import NormalLayout from '../NormalLayout';

test('match snapshot', () => {
    const component = renderer.create((
        <NormalLayout

        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
