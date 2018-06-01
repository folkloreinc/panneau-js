import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import renderer from 'react-test-renderer';
/* eslint-enable import/no-extraneous-dependencies */
import { IntlProvider } from 'react-intl';
import MediaField from '../MediaField';
import DocumentCard from '../DocumentCard';

test('match snapshot', () => {
    const component = renderer.create((
        <IntlProvider locale="en">
            <MediaField
                type="document"
                label="Label"
                CardComponent={DocumentCard}
            />
        </IntlProvider>
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
