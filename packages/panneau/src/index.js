import Panneau from '@panneau/core';
import fieldsCollection from '@panneau/fields';
import layoutsCollection from '@panneau/layouts';
import listsCollection from '@panneau/lists';
import formsCollection from '@panneau/forms';
import modalsCollection from '@panneau/modals';

import enMessages from '../intl/lang/en.json';
import frMessages from '../intl/lang/fr.json';

/* eslint-disable */
/* istanbul ignore next */
__webpack_public_path__ = typeof PANNEAU_ASSETS_PATH !== 'undefined' ? PANNEAU_ASSETS_PATH : '/';
/* eslint-enable */

// Set messages
Panneau.setDefaultLocaleMessages('en', enMessages);
Panneau.setDefaultLocaleMessages('fr', frMessages);

// Set default components
Panneau.setDefaultComponentsCollection(fieldsCollection, 'fields');
Panneau.setDefaultComponentsCollection(layoutsCollection, 'layouts');
Panneau.setDefaultComponentsCollection(listsCollection, 'lists');
Panneau.setDefaultComponentsCollection(formsCollection, 'forms');
Panneau.setDefaultComponentsCollection(modalsCollection, 'modals');

export {
    Panneau,
    fieldsCollection,
    layoutsCollection,
    listsCollection,
    formsCollection,
    modalsCollection,
};

const panneau = new Panneau();
export default (el) => {
    if (typeof el !== 'undefined') {
        panneau.render(el);
    }
    return panneau;
};
