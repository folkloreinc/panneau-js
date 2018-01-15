import Panneau from '@panneau/core';
import fieldsCollection from '@panneau/fields';
import layoutsCollection from '@panneau/layouts';
import listsCollection from '@panneau/lists';

Panneau.setDefaultComponentsCollection(fieldsCollection, 'fields');
Panneau.setDefaultComponentsCollection(layoutsCollection, 'layouts');
Panneau.setDefaultComponentsCollection(listsCollection, 'lists');

const panneau = new Panneau({

});

export {
    Panneau,
    fieldsCollection,
    layoutsCollection,
    panneau,
};

export default () => panneau;
