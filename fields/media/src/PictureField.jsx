import React from 'react';
import messages from './messages';
import MediaField from './MediaField';
import PictureCard from './PictureCard';

const PictureField = props => (
    <MediaField
        type="picture"
        CardComponent={PictureCard}
        uploadButtonLabel={messages.uploadPictureLabel}
        {...props}
    />
);

export default PictureField;
