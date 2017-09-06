import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../.storybook/storiesOf';
import ColorField from '../ColorField';
import KeepValue from '../../../.storybook/KeepValue';

storiesOf('Fields/Color', module)
    .add('simple', () => (
        <div>
            <KeepValue>
                <ColorField
                    label="Label"
                    onChange={action('change')}
                />
            </KeepValue>
            <KeepValue>
                <ColorField
                    label="Disabled"
                    value="#FFCC00"
                    disabled
                    onChange={action('change')}
                />
            </KeepValue>
        </div>

    ));
