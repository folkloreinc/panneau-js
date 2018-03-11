import React from 'react';
import messages from './messages';
import MediaField from './MediaField';
import AudioCard from './AudioCard';

const AudioField = props => (
    <MediaField
        type="audio"
        CardComponent={AudioCard}
        uploadButtonLabel={messages.uploadAudioLabel}
        {...props}
    />
);

export default AudioField;
