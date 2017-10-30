import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies

import storiesOf from '../../../../.storybook/storiesOf';
import Popover from '../Popover';
import PopoverButton from './PopoverButton';

storiesOf('Modals/Popover', module)
    .add('simple', () => (
        <div className="text-center">
            <PopoverButton>
                <Popover onClose={action('onClose')}>
                    Content
                </Popover>
            </PopoverButton>
            <hr />
            <PopoverButton buttonLabel="Open popover without arrow">
                <Popover title="Title" noArrow>
                    Content with title
                </Popover>
            </PopoverButton>
        </div>
    ))
    .add('without UI', () => (
        <div className="text-center">
            <PopoverButton>
                <Popover onClose={action('onClose')} noUi>
                    Content
                </Popover>
            </PopoverButton>
        </div>
    ));
