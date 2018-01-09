import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
import TableList from '../TableList';

const items = [

];

storiesOf('Lists/Table', module)
    .add('simple', () => (
        <div>
            <TableList
                items={items}
            />
        </div>
    ));
