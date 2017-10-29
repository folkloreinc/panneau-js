import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
import Popover from '../Popover';

storiesOf('Modals/Popover', module)
    .add('simple', () => (
        <div>
            <Popover>
                Content
            </Popover>
        </div>
    ));
