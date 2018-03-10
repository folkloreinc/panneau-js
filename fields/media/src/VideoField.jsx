import React from 'react';
import messages from './messages';
import MediaField from './MediaField';
import VideoComponent from './MediaVideo';

const VideoField = props => (
    <MediaField
        type="video"
        MediaComponent={VideoComponent}
        uploadButtonLabel={messages.uploadVideoLabel}
        {...props}
    />
);

export default VideoField;
