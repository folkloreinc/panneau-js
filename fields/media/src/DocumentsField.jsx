import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import MediasField from './MediasField';
import DocumentField from './DocumentField';

import messages from './messages';

const propTypes = {
    intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired,
    }).isRequired,
};

const DocumentsField = ({ intl, ...props }) => (
    <MediasField
        FieldComponent={DocumentField}
        addButtonTypeLabel={intl.formatMessage(messages.documentAddTypeLabel)}
        {...props}
    />
);

DocumentsField.propTypes = propTypes;

export default injectIntl(DocumentsField);
