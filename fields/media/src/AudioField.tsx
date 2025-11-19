/* eslint-disable react/jsx-props-no-spreading */
import React, { useMemo } from 'react';

import MediaField from './MediaField';

interface AudioFieldProps {
    [key: string]: unknown;
}

function AudioField(props: AudioFieldProps) {
    const types = useMemo(() => ['audio'], []);
    return <MediaField {...props} types={types} />;
}

export default AudioField;
