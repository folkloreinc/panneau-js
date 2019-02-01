import { withPreviewsCollection as baseWithPreviewsCollection } from '@panneau/core';

import defaultPreviewsCollection from './items';

const withPreviewsCollection = opts => baseWithPreviewsCollection({
    withRef: false,
    previewsCollection: defaultPreviewsCollection,
    ...opts,
});

export default withPreviewsCollection;
