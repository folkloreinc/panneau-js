import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import renderer from 'react-test-renderer';
/* eslint-enable import/no-extraneous-dependencies */
import { IntlProvider } from 'react-intl';
import MediaField from '../MediaField';
import MediaDocument from '../MediaDocument';

test('match snapshot', () => {
    const component = renderer.create((
        <IntlProvider locale="en">
            <MediaField
                label="Label"
                MediaComponent={MediaDocument}
            />
        </IntlProvider>
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
