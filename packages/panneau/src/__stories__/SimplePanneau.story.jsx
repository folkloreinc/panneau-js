import React from 'react';
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies
import { PanneauComponent as Panneau, ComponentsCollection } from '@panneau/core';
import fieldsCollection from '@panneau/fields';
import layoutsCollection from '@panneau/layouts';
import { navbarItemsCollection } from '@panneau/layout';
import listsCollection from '@panneau/lists';
import formsCollection from '@panneau/forms';
import modalsCollection from '@panneau/modals';

import storiesOf from '../../../../.storybook/storiesOf';

import simpleDefinition from './simple.json';

const componentsCollection = new ComponentsCollection();
componentsCollection.addComponents(fieldsCollection, 'fields');
componentsCollection.addComponents(layoutsCollection, 'layouts');
componentsCollection.addComponents(listsCollection, 'lists');
componentsCollection.addComponents(formsCollection, 'forms');
componentsCollection.addComponents(modalsCollection, 'modals');
componentsCollection.addComponents(navbarItemsCollection, 'navbarItems');

storiesOf('Panneau/Simple', module, {
    colWidth: 12,
}).add('simple', () => (
    <div>
        <Panneau
            user={{ id: 1 }}
            memoryRouter
            componentsCollection={componentsCollection}
            definition={simpleDefinition}
            onNavigate={action('navigate')}
        />
    </div>
));
