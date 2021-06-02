/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import UploadField from './UploadField';

const VideoField = (props) => <UploadField {...props} types={['video']} />;

export default React.memo(VideoField);