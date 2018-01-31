import Panneau from '@panneau/core';
import fieldsCollection from '@panneau/fields';
import layoutsCollection from '@panneau/layouts';
import listsCollection from '@panneau/lists';
import formsCollection from '@panneau/forms';
import modalsCollection from '@panneau/modals';

import enMessages from '../intl/lang/en.json';
import frMessages from '../intl/lang/fr.json';

// Set messages
Panneau.setDefaultLocaleMessages('en', enMessages);
Panneau.setDefaultLocaleMessages('fr', frMessages);

// Set default components
Panneau.setDefaultComponentsCollection(fieldsCollection, 'fields');
Panneau.setDefaultComponentsCollection(layoutsCollection, 'layouts');
Panneau.setDefaultComponentsCollection(listsCollection, 'lists');
Panneau.setDefaultComponentsCollection(formsCollection, 'forms');
Panneau.setDefaultComponentsCollection(modalsCollection, 'modals');

const panneau = new Panneau();

export {
    Panneau,
    fieldsCollection,
    layoutsCollection,
    listsCollection,
    formsCollection,
    modalsCollection,
    panneau,
};

export default () => panneau;
