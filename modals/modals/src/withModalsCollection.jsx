import { withModalsCollection as baseWithModalsCollection } from '@panneau/core';

import defaultModalsCollection from './items';

const withModalsCollection = opts => baseWithModalsCollection({
    withRef: false,
    modalsCollection: defaultModalsCollection,
    ...opts,
});

export default withModalsCollection;
