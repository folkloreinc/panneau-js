import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import MediasField from './MediasField';
import AudioField from './AudioField';

import messages from './messages';

const propTypes = {
    intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired,
    }).isRequired,
};

const AudiosField = ({ intl, ...props }) => (
    <MediasField
        FieldComponent={AudioField}
        addButtonTypeLabel={intl.formatMessage(messages.audioAddTypeLabel)}
        {...props}
    />
);

AudiosField.propTypes = propTypes;

export default injectIntl(AudiosField);
