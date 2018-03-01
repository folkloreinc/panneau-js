import { withFieldsCollection as baseWithFieldsCollection } from '@panneau/core';

import defaultFieldsCollection from './items';

const withFieldsCollection = opts => baseWithFieldsCollection({
    withRef: false,
    fieldsCollection: defaultFieldsCollection,
    ...opts,
});

export default withFieldsCollection;
