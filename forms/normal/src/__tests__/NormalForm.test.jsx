import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import renderer from 'react-test-renderer';
/* eslint-enable import/no-extraneous-dependencies */
import { IntlProvider } from 'react-intl';

import withFieldsCollection from '../../../../fields/fields/src/withFieldsCollection';
import NormalForm from '../NormalForm';

const NormalFormWithFields = withFieldsCollection({
    childContext: true,
})(NormalForm);

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
            <NormalFormWithFields
                fields={fields}
                value={value}
            />
        </IntlProvider>
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
