import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import ColorField from '../ColorField';

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

    ))
    .add('with input', () => (
        <div>
            <KeepValue>
                <ColorField
                    label="Label"
                    withInput
                    onChange={action('change')}
                />
            </KeepValue>
        </div>

    ));
