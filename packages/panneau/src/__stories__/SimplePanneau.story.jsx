import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies
import { PanneauComponent as Panneau } from '@panneau/core';
import fieldsCollection from '@panneau/fields';
import layoutsCollection from '@panneau/layouts';

import storiesOf from '../../../../.storybook/storiesOf';

import simpleDefinition from './simple.json';

storiesOf('Panneau/Simple', module, {
    colWidth: 12,
})
    .add('simple', () => (
        <div>
            <Panneau
                memoryRouter
                fieldsCollection={fieldsCollection}
                layoutsCollection={layoutsCollection}
                definition={simpleDefinition}
                onNavigate={action('navigate')}
            />
        </div>
    ));
