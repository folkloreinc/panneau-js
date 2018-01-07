import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

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
