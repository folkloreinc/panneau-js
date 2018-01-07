import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import NormalLayout from '../NormalLayout';

storiesOf('Layouts/Normal', module)
    .add('simple', () => (
        <div>
            <NormalLayout

            />
        </div>
    ));
