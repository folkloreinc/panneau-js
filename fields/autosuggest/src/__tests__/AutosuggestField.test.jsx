/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import renderer from 'react-test-renderer';
import { IntlProvider } from 'react-intl';
import AutosuggestField from '../AutosuggestField';

test('match snapshot', () => {
    const component = renderer.create((
        <IntlProvider locale="en">
            <AutosuggestField
                label="Label"
                value="value"
            />
        </IntlProvider>
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
