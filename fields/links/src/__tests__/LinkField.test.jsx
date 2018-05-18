/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider } from 'react-intl';

import LinkField from '../LinkField';

test('match snapshot', () => {
    const component = renderer.create((
        <IntlProvider locale="en">
            <LinkField
                label="Label"
                value={{
                    url: 'http://google.com',
                    label: 'Google',
                }}
            />
        </IntlProvider>
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
