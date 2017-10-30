import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies
import moment from 'moment';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import DateField from '../DateField';

moment.locale('fr');

storiesOf('Fields/Date', module)
    .add('simple', () => (
        <div>
            <KeepValue>
                <DateField
                    label="Label"
                    onChange={action('change')}
                />
            </KeepValue>
        </div>

    ))
    .add('range', () => (
        <div>
            <KeepValue>
                <DateField
                    label="Label"
                    type="daterange"
                    onChange={action('change')}
                />
            </KeepValue>
        </div>
    ));
