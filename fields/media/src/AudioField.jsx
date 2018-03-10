import React from 'react';
import messages from './messages';
import MediaField from './MediaField';
import AudioComponent from './MediaAudio';

const AudioField = props => (
    <MediaField
        type="audio"
        MediaComponent={AudioComponent}
        uploadButtonLabel={messages.uploadAudioLabel}
        {...props}
    />
);

export default AudioField;
