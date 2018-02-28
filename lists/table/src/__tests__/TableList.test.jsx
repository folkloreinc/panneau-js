import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import renderer from 'react-test-renderer';
import { IntlProvider } from 'react-intl';
/* eslint-enable import/no-extraneous-dependencies */
import TableList from '../TableList';

const items = [

];

test('match snapshot', () => {
    const component = renderer.create((
        <IntlProvider locale="en">
            <TableList
                items={items}
            />
        </IntlProvider>
    ));
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
