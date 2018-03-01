import { withFormsCollection as baseWithFormsCollection } from '@panneau/core';

import defaultFormsCollection from './items';

const withFormsCollection = opts => baseWithFormsCollection({
    withRef: false,
    formsCollection: defaultFormsCollection,
    ...opts,
});

export default withFormsCollection;
