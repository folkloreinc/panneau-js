import { withListsCollection as baseWithListsCollection } from '@panneau/core';

import defaultListsCollection from './items';

const withListsCollection = opts => baseWithListsCollection({
    withRef: false,
    listsCollection: defaultListsCollection,
    ...opts,
});

export default withListsCollection;
