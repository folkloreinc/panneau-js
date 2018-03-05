import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import ItemField from '../ItemField';

storiesOf('Fields/Item', module)
    .add('simple', () => (
        <div>
            <KeepValue>
                <ItemField
                    label="Label"
                    helpText="This is an help text"
                    onChange={action('change')}
                />
            </KeepValue>
        </div>
    ));
