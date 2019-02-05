/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import <%= componentName %> from '../<%= componentName %>';

const value = {
    text: 'Text',
};

test('match snapshot', () => {
    const component = renderer.create((
        <<%= componentName %>
            value={value}
        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
