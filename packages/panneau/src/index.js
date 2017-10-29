import Panneau from '@panneau/core';
import fieldsCollection from '@panneau/fields';

const panneau = new Panneau({
    fieldsCollection,
});

export {
    Panneau,
    fieldsCollection,
    panneau,
};

export default () => panneau;
