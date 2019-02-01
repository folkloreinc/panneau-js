import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import renderer from 'react-test-renderer';
import { withFieldsCollection } from '@panneau/fields';
/* eslint-enable import/no-extraneous-dependencies */
import { IntlProvider } from 'react-intl';
import PreviewForm from '../PreviewForm';

const PreviewFormWithFields = withFieldsCollection({
    childContext: true,
})(PreviewForm);

const fields = [
    {
        type: 'text',
        label: 'Text',
        name: 'text',
    },
];

const value = {
    text: 'Text',
};

test('match snapshot', () => {
    const component = renderer.create((
        <IntlProvider locale="en">
            <PreviewFormWithFields
                fields={fields}
                value={value}
            />
        </IntlProvider>
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
