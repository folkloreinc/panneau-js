import React from 'react';
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
import NormalLayout from '../NormalLayout';

storiesOf('Layouts/Normal', module).add('simple', () => (
    <div>
        <NormalLayout />
    </div>
));
