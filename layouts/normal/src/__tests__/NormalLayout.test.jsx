import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import { Provider } from 'react-redux';
import { createStore } from '@panneau/core';

import NormalLayout from '../NormalLayout';

const store = createStore();

test('match snapshot', () => {
    const component = renderer.create((
        <Provider store={store}>
            <NormalLayout

            />
        </Provider>
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
