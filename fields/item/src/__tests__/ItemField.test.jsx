/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider } from 'react-intl';
import ItemField from '../ItemField';

test('match snapshot', () => {
    const component = renderer.create((
        <IntlProvider locale="en">
            <ItemField
                label="Label"
                value={{}}
            />
        </IntlProvider>
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
