import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies
import { IntlProvider } from 'react-intl';

import storiesOf from '../../../../.storybook/storiesOf';
import ButtonGroup from '../ButtonGroup';

const buttons = [
    {
        label: 'Button 1',
        onClick: action('click Button 1'),
    },
    {
        label: 'Button 2',
        icon: 'glyphicon glyphicon-trash',
        onClick: action('click Button 2'),
    },
];

storiesOf('Fields/Core/ButtonGroup', module)
    .add('simple', () => (
        <div>
            <IntlProvider locale="en">
                <ButtonGroup
                    buttons={buttons}
                />
            </IntlProvider>
        </div>
    ));
