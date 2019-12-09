import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies
import moment from 'moment';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import DateField from '../DateField';
import DateRangeField from '../DateRangeField';

moment.locale('fr');

storiesOf('Fields/Date', module)
    .add('simple', () => (
        <div>
            <KeepValue>
                <DateField
                    label="Label"
                    value="2019-01-01"
                    onChange={action('change')}
                />
            </KeepValue>
        </div>

    ))
    .add('range', () => (
        <div>
            <KeepValue>
                <DateRangeField
                    label="Label"
                    onChange={action('change')}
                />
            </KeepValue>
        </div>
    ));
