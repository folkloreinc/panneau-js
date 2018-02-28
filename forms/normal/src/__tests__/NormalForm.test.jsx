import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import renderer from 'react-test-renderer';
/* eslint-enable import/no-extraneous-dependencies */
import { IntlProvider } from 'react-intl';
import NormalForm from '../NormalForm';

const fields = [

];

test('match snapshot', () => {
    const component = renderer.create((
        <IntlProvider locale="en">
            <NormalForm
                fields={fields}
            />
        </IntlProvider>
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
