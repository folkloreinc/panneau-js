import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../.storybook/storiesOf';
import Field from '../Field';
import KeepValue from '../../../.storybook/KeepValue';

storiesOf('Fields/Field', module)
    .add('simple', () => (
        <div>
            <KeepValue>
                <Field
                    label="Label"
                    helpText="This is an help text"
                    placeholder="This is a placeholder..."
                    onChange={action('change')}
                />
            </KeepValue>
        </div>
    ));
