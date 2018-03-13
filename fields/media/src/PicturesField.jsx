import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import MediasField from './MediasField';
import PictureField from './PictureField';

import messages from './messages';

const propTypes = {
    intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired,
    }).isRequired,
};

const PicturesField = ({ intl, ...props }) => (
    <MediasField
        FieldComponent={PictureField}
        addButtonTypeLabel={intl.formatMessage(messages.pictureAddTypeLabel)}
        {...props}
    />
);

PicturesField.propTypes = propTypes;

export default injectIntl(PicturesField);
