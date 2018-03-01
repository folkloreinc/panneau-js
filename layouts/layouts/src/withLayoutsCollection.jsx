import { withLayoutsCollection as baseWithLayoutsCollection } from '@panneau/core';

import defaultLayoutsCollection from './items';

const withLayoutsCollection = opts => baseWithLayoutsCollection({
    withRef: false,
    layoutsCollection: defaultLayoutsCollection,
    ...opts,
});

export default withLayoutsCollection;
