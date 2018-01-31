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
];

storiesOf('Lists/Table', module)
    .add('simple', () => (
        <div>
            <IntlProvider locale="en">
                <TableList
                    items={items}
                />
            </IntlProvider>
        </div>
    ));
