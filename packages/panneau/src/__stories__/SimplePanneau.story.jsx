import React from 'react';
import { action } from '@storybook/addon-actions';// eslint-disable-line import/no-extraneous-dependencies
import { PanneauComponent as Panneau, ComponentsCollection } from '@panneau/core';
import fieldsCollection from '@panneau/fields';
import layoutsCollection from '@panneau/layouts';
import listsCollection from '@panneau/lists';

import storiesOf from '../../../../.storybook/storiesOf';

import simpleDefinition from './simple.json';

const componentsCollection = new ComponentsCollection();
componentsCollection.addComponents(fieldsCollection, 'fields');
componentsCollection.addComponents(layoutsCollection, 'layouts');
componentsCollection.addComponents(listsCollection, 'lists');

console.log(componentsCollection.getCollection());
console.log(componentsCollection.getCollection('layouts'));

storiesOf('Panneau/Simple', module, {
    colWidth: 12,
})
    .add('simple', () => (
        <div>
            <Panneau
                memoryRouter
                componentsCollection={componentsCollection}
                definition={simpleDefinition}
                onNavigate={action('navigate')}
            />
        </div>
    ));
