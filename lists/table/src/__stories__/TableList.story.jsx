import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import { IntlProvider } from 'react-intl';
/* eslint-enable import/no-extraneous-dependencies */

import storiesOf from '../../../../.storybook/storiesOf';
import TableList from '../TableList';

const items = [
    {
        id: '1',
        name: 'Test 1',
    },
    {
        id: '2',
        name: 'Test 2',
    },
    {
        id: '3',
        name: 'Test 3',
    },
];

const columns = [
    {
        id: 'id',
        path: 'id',
        label: 'ID',
        width: 50,
    },
    {
        id: 'actions',
        label: 'Actions',
        type: 'actions',
        align: 'right',
        iconsOnly: true,
    },
];

storiesOf('Lists/Table', module)
    .add('simple', () => (
        <div>
            <IntlProvider locale="en">
                <div>
                    <h4>Normal</h4>
                    <TableList
                        items={items}
                    />
                    <hr />
                    <h4>Icons only</h4>
                    <TableList
                        items={items}
                        cols={columns}
                    />
                </div>

            </IntlProvider>
        </div>
    ))
    .add('empty', () => (
        <div>
            <IntlProvider locale="en">
                <TableList />
            </IntlProvider>
        </div>
    ));
