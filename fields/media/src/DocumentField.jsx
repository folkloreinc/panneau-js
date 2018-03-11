import React from 'react';
import messages from './messages';
import MediaField from './MediaField';
import DocumentCard from './DocumentCard';

const DocumentField = props => (
    <MediaField
        type="document"
        CardComponent={DocumentCard}
        uploadButtonLabel={messages.uploadDocumentLabel}
        {...props}
    />
);

export default DocumentField;
