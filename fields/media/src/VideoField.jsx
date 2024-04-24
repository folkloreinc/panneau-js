/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import MediaField from './MediaField';

const VideoField = (props) => {
    const types = useMemo(() => ['video'], []);
    return <MediaField {...props} types={types} />;
};

export default VideoField;
