import React from 'react';
import renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';

import NormalLayout from '../NormalLayout';

test('match snapshot', () => {
    const component = renderer.create((
        <MemoryRouter>
            <NormalLayout
                gotoHome={() => {}}
                gotoLink={() => {}}
                gotoRoute={() => {}}
            />
        </MemoryRouter>
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
