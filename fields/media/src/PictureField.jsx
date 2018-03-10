import React from 'react';
import messages from './messages';
import MediaField from './MediaField';
import PictureComponent from './MediaPicture';

const PictureField = props => (
    <MediaField
        type="picture"
        MediaComponent={PictureComponent}
        uploadButtonLabel={messages.uploadPictureLabel}
        {...props}
    />
);

export default PictureField;
