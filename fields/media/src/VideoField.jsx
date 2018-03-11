import React from 'react';
import messages from './messages';
import MediaField from './MediaField';
import VideoCard from './VideoCard';

const VideoField = props => (
    <MediaField
        type="video"
        CardComponent={VideoCard}
        uploadButtonLabel={messages.uploadVideoLabel}
        {...props}
    />
);

export default VideoField;
