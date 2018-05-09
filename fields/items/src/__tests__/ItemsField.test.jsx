/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { IntlProvider } from 'react-intl';
import renderer from 'react-test-renderer';
import ItemsField from '../ItemsField';

test('match snapshot', () => {
    const component = renderer.create((
        <IntlProvider locale="en">
            <ItemsField
                label="Label"
                value={[]}
            />
        </IntlProvider>
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
