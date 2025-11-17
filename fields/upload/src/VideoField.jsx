/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import UploadField from './UploadField';

function VideoField(props) {
    const types = useMemo(() => ['video'], []);
    return <UploadField {...props} types={types} />;
}

export default VideoField;
