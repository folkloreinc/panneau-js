import React from 'react';
import messages from './messages';
import MediaField from './MediaField';
import DocumentComponent from './MediaDocument';

const DocumentField = props => (
    <MediaField
        type="document"
        MediaComponent={DocumentComponent}
        uploadButtonLabel={messages.uploadDocumentLabel}
        {...props}
    />
);

export default DocumentField;
