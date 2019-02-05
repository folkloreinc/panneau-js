import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import renderer from 'react-test-renderer';
/* eslint-enable import/no-extraneous-dependencies */
import { IntlProvider } from 'react-intl';
import JsonPreview from '../JsonPreview';

const value = {
    text: 'Text',
};

test('match snapshot', () => {
    const component = renderer.create((
        <IntlProvider locale="en">
            <JsonPreview
                value={value}
            />
        </IntlProvider>
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
