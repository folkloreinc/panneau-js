/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider } from 'react-intl';
import BlocksField from '../BlocksField';

test('match snapshot', () => {
    const component = renderer.create((
        <IntlProvider locale="en">
            <BlocksField
                label="Label"
                value={[]}
            />
        </IntlProvider>
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
