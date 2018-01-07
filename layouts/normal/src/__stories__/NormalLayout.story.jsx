import React from 'react';
import { Provider } from 'react-redux';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies
import { createStore } from '@panneau/core';

import storiesOf from '../../../../.storybook/storiesOf';
import NormalLayout from '../NormalLayout';

const store = createStore();

storiesOf('Layouts/Normal', module)
    .add('simple', () => (
        <div>
            <Provider store={store}>
                <NormalLayout

                />
            </Provider>
        </div>
    ));
