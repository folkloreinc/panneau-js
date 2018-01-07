import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
import KeepValue from '../../../../.storybook/KeepValue';
import Header from '../Header';

storiesOf('Layouts/Core', module)
    .add('Header', () => (
        <div>
            <Header

            />
        </div>
    ));
