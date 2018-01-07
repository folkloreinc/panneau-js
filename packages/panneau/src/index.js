import Panneau from '@panneau/core';
import fieldsCollection from '@panneau/fields';
import layoutsCollection from '@panneau/layouts';

Panneau.setDefaultFieldsCollection(fieldsCollection);
Panneau.setDefaultLayoutsCollection(layoutsCollection);

const panneau = new Panneau({

});

export {
    Panneau,
    fieldsCollection,
    layoutsCollection,
    panneau,
};

export default () => panneau;
