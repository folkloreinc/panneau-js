import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import { MemoryRouter } from 'react-router';
import Header from '../Header';

test('match snapshot', () => {
    const component = renderer.create(
        <MemoryRouter>
            <Header gotoHome={() => {}} gotoLink={() => {}} gotoRoute={() => {}} />
        </MemoryRouter>,
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
