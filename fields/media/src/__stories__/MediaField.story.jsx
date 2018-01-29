import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import MediaField from '../MediaField';

storiesOf('Fields/Media', module)
    .add('simple', () => (
        <div>
            <KeepValue>
                <MediaField
                    label="Label"
                    helpText="This is an help text"
                    onChange={action('change')}
                />
            </KeepValue>
        </div>
    ));
