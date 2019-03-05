import React from 'react';
/* eslint-disable import/no-extraneous-dependencies */
import { IntlProvider } from 'react-intl';
/* eslint-enable import/no-extraneous-dependencies */

import storiesOf from '../../../../.storybook/storiesOf';
import columnsCollection from '../columns';
import TableList from '../TableList';

const items = [
    {
        id: '1',
        name: 'Test 1',
        image: 'http://placehold.it/300x200',
    },
    {
        id: '2',
        name: 'Test 2',
        image: 'http://placehold.it/300x200',
    },
    {
        id: '3',
        name: 'Test 3',
        image: 'http://placehold.it/300x200',
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
        id: 'image',
        type: 'image',
        path: 'image',
        label: 'Image',
        width: 50,
    },
    {
        id: 'actions',
        label: 'Actions',
        type: 'actions',
        align: 'right',
        withIcons: true,
        withoutLabel: true,
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
                        columnsCollection={columnsCollection}
                    />
                    <hr />
                    <h4>Icons only</h4>
                    <TableList
                        items={items}
                        columnsCollection={columnsCollection}
                        cols={columns}
                    />
                </div>

            </IntlProvider>
        </div>
    ))
    .add('empty', () => (
        <div>
            <IntlProvider locale="en">
                <TableList columnsCollection={columnsCollection} />
            </IntlProvider>
        </div>
    ));
