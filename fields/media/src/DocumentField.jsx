import React from 'react';

import MediaField from './MediaField';
import DocumentComponent from './MediaDocument';

const DocumentField = props => (
    <MediaField type="document" MediaComponent={DocumentComponent} {...props} />
);

export default DocumentField;
