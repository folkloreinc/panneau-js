/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { action } from '@storybook/addon-actions';

import storiesOf from '../../../../.storybook/storiesOf';
import <%= componentName %> from '../<%= componentName %>';

const items = [

];

storiesOf('Lists/<%= prettyName %>', module)
    .add('simple', () => (
        <div>
            <<%= componentName %>
                items={items}
            />
        </div>
    ));
