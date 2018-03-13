import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import MediasField from './MediasField';
import VideoField from './VideoField';

import messages from './messages';

const propTypes = {
    intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired,
    }).isRequired,
};

const VideosField = ({ intl, ...props }) => (
    <MediasField
        FieldComponent={VideoField}
        addButtonTypeLabel={intl.formatMessage(messages.videoAddTypeLabel)}
        {...props}
    />
);

VideosField.propTypes = propTypes;

export default injectIntl(VideosField);
