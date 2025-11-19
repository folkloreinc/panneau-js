/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import UploadField from './UploadField';

interface VideoFieldProps {
    [key: string]: unknown;
}

function VideoField(props: VideoFieldProps) {
    const types = useMemo(() => ['video'] as const, []);
    return <UploadField {...props} types={types} />;
}

export default VideoField;
