import React from 'react';
import { action } from '@storybook/addon-actions'; // eslint-disable-line import/no-extraneous-dependencies
import { PanneauComponent as Panneau } from '@panneau/app';
import { ComponentsCollection } from '@panneau/core';
import * as FieldsComponents from '@panneau/fields';
import * as LayoutsComponents from '@panneau/layouts';
import * as NavbarItemsComponents from '@panneau/layout/navbarItems';
import * as ColumnsComponents from '@panneau/list-table/columns';
import * as ListsComponent from '@panneau/lists';
import * as FormsComponent from '@panneau/forms';
import * as PreviewsComponent from '@panneau/previews';
import * as ModalsComponent from '@panneau/modals';

import storiesOf from '../../../../.storybook/storiesOf';

import simpleDefinition from './simple.json';

const componentsCollection = new ComponentsCollection();
componentsCollection.addComponents(FieldsComponents, 'fields');
componentsCollection.addComponents(LayoutsComponents, 'layouts');
componentsCollection.addComponents(ListsComponent, 'lists');
componentsCollection.addComponents(FormsComponent, 'forms');
componentsCollection.addComponents(ModalsComponent, 'modals');
componentsCollection.addComponents(PreviewsComponent, 'previews');
componentsCollection.addComponents(NavbarItemsComponents, 'navbarItems');
componentsCollection.addComponents(ColumnsComponents, 'tableColumns');

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
