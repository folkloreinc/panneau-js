/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { action } from '@storybook/addon-actions';

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import <%= componentName %> from '../<%= componentName %>';

storiesOf('Modals/<%= prettyName %>', module)
    .add('simple', () => (
        <div>
            <<%= componentName %>

            />
        </div>
    ));
