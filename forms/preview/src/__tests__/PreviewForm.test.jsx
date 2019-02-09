import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import renderer from 'react-test-renderer';
/* eslint-enable import/no-extraneous-dependencies */
import { IntlProvider } from 'react-intl';

import withFieldsCollection from '../../../../fields/fields/src/withFieldsCollection';
import withPreviewsCollection from '../../../../previews/previews/src/withPreviewsCollection';
import withFormsCollection from '../../../forms/src/withFormsCollection';
import PreviewForm from '../PreviewForm';

const PreviewFormWithFields = withFieldsCollection({
    childContext: true,
})(PreviewForm);
const PreviewFormWithForms = withFormsCollection({
    childContext: true,
})(PreviewFormWithFields);
const PreviewFormWithPreviews = withPreviewsCollection({
    childContext: true,
})(PreviewFormWithForms);

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
            <PreviewFormWithPreviews
                fields={fields}
                value={value}
            />
        </IntlProvider>
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
