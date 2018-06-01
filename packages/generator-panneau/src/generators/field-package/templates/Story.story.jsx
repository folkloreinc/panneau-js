/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { action } from '@storybook/addon-actions';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import <%= componentName %> from '../<%= componentName %>';

storiesOf('Fields/<%= prettyName %>', module)
    .add('simple', () => (
        <div>
            <KeepValue>
                <<%= componentName %>
                    label="Label"
                    helpText="This is an help text"
                    onChange={action('change')}
                />
            </KeepValue>
        </div>
    ));
