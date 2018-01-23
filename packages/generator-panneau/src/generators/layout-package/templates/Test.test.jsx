import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import <%= componentName %> from '../<%= componentName %>';

test('match snapshot', () => {
    const component = renderer.create((
        <<%= componentName %>

        />
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
