import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import Header from '../Header';

test('match snapshot', () => {
    const component = renderer.create((
        <Header

        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
